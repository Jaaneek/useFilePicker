import { useState, useCallback } from 'react';
import { fromEvent, type FileWithPath } from 'file-selector';
import type {
  UseFilePickerConfig,
  FileContent,
  FilePickerReturnTypes,
  UseFilePickerError,
  ReaderMethod,
  ExtractContentTypeFromConfig,
  OpenFilePickerOverrideOptions,
} from './interfaces.js';
import { openFileDialog } from './helpers/openFileDialog.js';
import { useValidators } from './validators/useValidators.js';
import { Validator } from './validators.js';

// empty array reference in order to avoid re-renders when no validators are passed as props
const EMPTY_ARRAY: Validator[] = [];

function useFilePicker<
  CustomErrors = unknown,
  ConfigType extends UseFilePickerConfig<CustomErrors> = UseFilePickerConfig<CustomErrors>,
>(props: ConfigType = {} as ConfigType): FilePickerReturnTypes<ExtractContentTypeFromConfig<ConfigType>, CustomErrors> {
  const {
    accept = '*',
    multiple = true,
    readAs = 'Text',
    readFilesContent = true,
    validators = EMPTY_ARRAY,
    initializeWithCustomParameters,
    detectCancellation = false,
  } = props;

  const [plainFiles, setPlainFiles] = useState<File[]>([]);
  const [filesContent, setFilesContent] = useState<FileContent<ExtractContentTypeFromConfig<ConfigType>>[]>([]);
  const [fileErrors, setFileErrors] = useState<UseFilePickerError<CustomErrors>[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { onFilesSelected, onFilesSuccessfullySelected, onFilesRejected, onClear } = useValidators<
    ConfigType,
    CustomErrors
  >(props);

  const clear: () => void = useCallback(() => {
    setPlainFiles([]);
    setFilesContent([]);
    setFileErrors([]);
  }, []);

  const clearWithEventListener: () => void = useCallback(() => {
    clear();
    onClear?.();
  }, [clear, onClear]);

  const parseFile = useCallback(
    (file: FileWithPath, overrides: OpenFilePickerOverrideOptions<CustomErrors> = {}) =>
      new Promise<FileContent<ExtractContentTypeFromConfig<ConfigType>>>(
        (
          resolve: (fileContent: FileContent<ExtractContentTypeFromConfig<ConfigType>>) => void,
          reject: (reason: UseFilePickerError) => void
        ) => {
          const {
            readAs: readAsOverride = readAs,
            encoding: encodingOverride,
            validators: validatorsOverride = validators,
          } = overrides;
          const reader = new FileReader();
          const encoding = encodingOverride ?? (props.readAs === 'Text' ? props.encoding : undefined);

          //availible reader methods: readAsText, readAsBinaryString, readAsArrayBuffer, readAsDataURL
          const readStrategy = reader[`readAs${readAsOverride}` as ReaderMethod] as typeof reader.readAsText;
          readStrategy.call(reader, file, encoding);

          const addError = ({ ...others }: UseFilePickerError) => {
            reject({ ...others });
          };

          reader.onload = async () =>
            Promise.all(
              validatorsOverride.map(validator =>
                validator
                  .validateAfterParsing(props, file, reader)
                  .catch((err: UseFilePickerError) => Promise.reject(addError(err)))
              )
            )
              .then(() =>
                resolve({
                  content: reader.result as string,
                  name: file.name,
                  lastModified: file.lastModified,
                  path: file.path,
                  size: file.size,
                  type: file.type,
                } as FileContent<ExtractContentTypeFromConfig<ConfigType>>)
              )
              .catch(() => {});

          reader.onerror = () => {
            addError({ name: 'FileReaderError', readerError: reader.error, causedByFile: file });
          };
        }
      ),
    [props, readAs, validators]
  );

  const openFilePicker: FilePickerReturnTypes<
    ExtractContentTypeFromConfig<ConfigType>,
    CustomErrors
  >['openFilePicker'] = useCallback(
    async (overrides = {}) => {
      const {
        accept: acceptOverride = accept,
        initializeWithCustomParameters: initializeWithCustomParametersOverride = initializeWithCustomParameters,
        multiple: multipleOverride = multiple,
        readFilesContent: readFilesContentOverride = readFilesContent,
        validators: validatorsOverride = validators,
        detectCancellation: detectCancellationOverride = detectCancellation,
      } = overrides;
      return new Promise<
        Awaited<
          ReturnType<FilePickerReturnTypes<ExtractContentTypeFromConfig<ConfigType>, CustomErrors>['openFilePicker']>
        >
      >((resolve, reject) => {
        const fileExtensions = acceptOverride instanceof Array ? acceptOverride.join(',') : acceptOverride;

        openFileDialog(
          fileExtensions,
          multipleOverride,
          async evt => {
            clear();
            setLoading(true);
            const plainFileObjects = (await fromEvent(evt)) as FileWithPath[];

            const validationsBeforeParsing = (
              await Promise.all(
                validatorsOverride.map(validator =>
                  validator
                    .validateBeforeParsing(props, plainFileObjects)
                    .catch((err: UseFilePickerError | UseFilePickerError[]) => (Array.isArray(err) ? err : [err]))
                )
              )
            )
              .flat(1)
              .filter(Boolean) as UseFilePickerError<CustomErrors>[];

            setPlainFiles(plainFileObjects);
            setFileErrors(validationsBeforeParsing);
            if (validationsBeforeParsing.length) {
              setPlainFiles([]);
              onFilesRejected?.({ errors: validationsBeforeParsing });
              onFilesSelected?.({ errors: validationsBeforeParsing });
              setLoading(false);
              resolve({
                filesContent: [],
                errors: validationsBeforeParsing,
                plainFiles: plainFileObjects,
              });
              return;
            }

            if (!readFilesContentOverride) {
              onFilesSelected?.({ plainFiles: plainFileObjects, filesContent: [] });
              setLoading(false);
              resolve({
                filesContent: [],
                errors: [],
                plainFiles: plainFileObjects,
              });
              return;
            }

            const validationsAfterParsing: UseFilePickerError<CustomErrors>[] = [];
            const filesContent = (await Promise.all(
              plainFileObjects.map(file =>
                parseFile(file, overrides).catch(
                  (fileError: UseFilePickerError<CustomErrors> | UseFilePickerError<CustomErrors>[]) => {
                    validationsAfterParsing.push(...(Array.isArray(fileError) ? fileError : [fileError]));
                  }
                )
              )
            )) as FileContent<ExtractContentTypeFromConfig<ConfigType>>[];
            setLoading(false);

            if (validationsAfterParsing.length) {
              setPlainFiles([]);
              setFilesContent([]);
              setFileErrors(errors => [...errors, ...validationsAfterParsing]);
              onFilesRejected?.({ errors: validationsAfterParsing });
              onFilesSelected?.({
                errors: validationsBeforeParsing.concat(validationsAfterParsing),
              });
              resolve({
                filesContent: [],
                errors: validationsAfterParsing,
                plainFiles: plainFileObjects,
              });
              return;
            }

            setFilesContent(filesContent);
            setPlainFiles(plainFileObjects);
            setFileErrors([]);
            onFilesSuccessfullySelected?.({ filesContent: filesContent, plainFiles: plainFileObjects });
            onFilesSelected?.({
              plainFiles: plainFileObjects,
              filesContent: filesContent,
            });
            resolve({
              filesContent: filesContent,
              errors: [],
              plainFiles: plainFileObjects,
            });
          },
          initializeWithCustomParametersOverride ?? initializeWithCustomParameters
        ).catch(err => {
          if (err.name === 'SelectionCancelledError') {
            if (detectCancellationOverride === 'promiseResultAndHookState') {
              setFileErrors(errors => [...errors, err]);
            }
            resolve({
              filesContent: [],
              errors: detectCancellationOverride ? [err] : [],
              plainFiles: [],
            });
            return;
          }

          reject(err);
        });
      });
    },
    [
      props,
      accept,
      clear,
      initializeWithCustomParameters,
      multiple,
      onFilesRejected,
      onFilesSelected,
      onFilesSuccessfullySelected,
      parseFile,
      readFilesContent,
      detectCancellation,
      validators,
    ]
  );

  return {
    openFilePicker,
    filesContent,
    errors: fileErrors,
    loading,
    plainFiles,
    clear: clearWithEventListener,
  };
}

export default useFilePicker;
