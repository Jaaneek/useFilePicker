import { useState, useCallback } from 'react';
import { fromEvent, FileWithPath } from 'file-selector';
import {
  UseFilePickerConfig,
  FileContent,
  FilePickerReturnTypes,
  UseFilePickerError,
  ReaderMethod,
  ExtractContentTypeFromConfig,
} from './interfaces';
import { openFileDialog } from './helpers/openFileDialog';
import { useValidators } from './validators/useValidators';

function useFilePicker<ConfigType extends UseFilePickerConfig>(
  props: ConfigType
): FilePickerReturnTypes<ExtractContentTypeFromConfig<ConfigType>> {
  const {
    accept = '*',
    multiple = true,
    readAs = 'Text',
    readFilesContent = true,
    validators = [],
    initializeWithCustomParameters,
  } = props;

  const [plainFiles, setPlainFiles] = useState<File[]>([]);
  const [filesContent, setFilesContent] = useState<FileContent<ExtractContentTypeFromConfig<ConfigType>>[]>([]);
  const [fileErrors, setFileErrors] = useState<UseFilePickerError[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { onFilesSelected, onFilesSuccessfulySelected, onFilesRejected, onClear } = useValidators(props as any);

  const clear: () => void = useCallback(() => {
    setPlainFiles([]);
    setFilesContent([]);
    setFileErrors([]);
  }, []);

  const clearWithEventListener: () => void = useCallback(() => {
    clear();
    onClear?.();
  }, [clear, onClear]);

  const parseFile = (file: FileWithPath) =>
    new Promise<FileContent<ExtractContentTypeFromConfig<ConfigType>>>(
      async (
        resolve: (fileContent: FileContent<ExtractContentTypeFromConfig<ConfigType>>) => void,
        reject: (reason: UseFilePickerError) => void
      ) => {
        const reader = new FileReader();

        //availible reader methods: readAsText, readAsBinaryString, readAsArrayBuffer, readAsDataURL
        const readStrategy = reader[`readAs${readAs}` as ReaderMethod] as typeof reader.readAsText;
        readStrategy.call(reader, file);

        const addError = ({ fileName = file.name, ...others }: UseFilePickerError) => {
          reject({ fileName, ...others });
        };

        reader.onload = async () =>
          Promise.all(
            validators.map(validator =>
              validator.validateAfterParsing(props, file, reader).catch(err => Promise.reject(addError(err)))
            )
          )
            .then(() =>
              resolve({
                ...file,
                content: reader.result as string,
                name: file.name,
                lastModified: file.lastModified,
              } as FileContent<ExtractContentTypeFromConfig<ConfigType>>)
            )
            .catch(() => {});

        reader.onerror = () => {
          addError({ name: 'FileReaderError', fileName: file.name, readerError: reader.error, causedByFile: file });
        };
      }
    );

  const openFilePicker = () => {
    const fileExtensions = accept instanceof Array ? accept.join(',') : accept;
    openFileDialog(
      fileExtensions,
      multiple,
      async evt => {
        clear();
        const inputElement = evt.target as HTMLInputElement;
        const plainFileObjects = inputElement.files ? Array.from(inputElement.files) : [];

        setLoading(true);

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
          .filter(Boolean) as UseFilePickerError[];

        setPlainFiles(plainFileObjects);
        setFileErrors(validationsBeforeParsing);
        if (validationsBeforeParsing.length) {
          setLoading(false);
          setPlainFiles([]);
          onFilesRejected?.({ errors: validationsBeforeParsing });
          onFilesSelected?.({ errors: validationsBeforeParsing });
          return;
        }

        if (!readFilesContent) {
          setLoading(false);
          onFilesSelected?.({ plainFiles: plainFileObjects, filesContent: [] });
          return;
        }

        const files = (await fromEvent(evt)) as FileWithPath[];

        const validationsAfterParsing: UseFilePickerError[] = [];
        const filesContent = (await Promise.all(
          files.map(file =>
            parseFile(file).catch((fileError: UseFilePickerError | UseFilePickerError[]) => {
              validationsAfterParsing.push(...(Array.isArray(fileError) ? fileError : [fileError]));
            })
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
        onFilesSuccessfulySelected?.({ filesContent: filesContent as any, plainFiles: plainFileObjects });
        onFilesSelected?.({
          plainFiles: plainFileObjects,
          filesContent: filesContent as any,
        });
      },
      initializeWithCustomParameters
    );
  };

  return { openFilePicker, filesContent, errors: fileErrors, loading, plainFiles, clear: clearWithEventListener };
}

export default useFilePicker;
