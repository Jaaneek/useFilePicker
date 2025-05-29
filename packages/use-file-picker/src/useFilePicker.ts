import { useState, useCallback } from 'react';
import { fromEvent, type FileWithPath } from 'file-selector';
import type {
  UseFilePickerConfig,
  FileContent,
  FilePickerReturnTypes,
  UseFilePickerError,
  ReaderMethod,
  ExtractContentTypeFromConfig,
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
    (file: FileWithPath) =>
      new Promise<FileContent<ExtractContentTypeFromConfig<ConfigType>>>(
        (
          resolve: (fileContent: FileContent<ExtractContentTypeFromConfig<ConfigType>>) => void,
          reject: (reason: UseFilePickerError) => void
        ) => {
          const reader = new FileReader();

          //availible reader methods: readAsText, readAsBinaryString, readAsArrayBuffer, readAsDataURL
          const readStrategy = reader[`readAs${readAs}` as ReaderMethod] as typeof reader.readAsText;
          readStrategy.call(reader, file, props.readAs === 'Text' ? props.encoding : undefined);

          const addError = ({ ...others }: UseFilePickerError) => {
            reject({ ...others });
          };

          reader.onload = async () =>
            Promise.all(
              validators.map(validator =>
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

  const openFilePicker = useCallback(() => {
    const fileExtensions = accept instanceof Array ? accept.join(',') : accept;
    openFileDialog(
      fileExtensions,
      multiple,
      async evt => {
        clear();
        setLoading(true);
        const plainFileObjects = (await fromEvent(evt)) as FileWithPath[];

        const validationsBeforeParsing = (
          await Promise.all(
            validators.map(validator =>
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
          return;
        }

        if (!readFilesContent) {
          onFilesSelected?.({ plainFiles: plainFileObjects, filesContent: [] });
          setLoading(false);
          return;
        }

        const validationsAfterParsing: UseFilePickerError<CustomErrors>[] = [];
        const filesContent = (await Promise.all(
          plainFileObjects.map(file =>
            parseFile(file).catch(
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
      },
      initializeWithCustomParameters
    );
  }, [
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
    validators,
  ]);

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
