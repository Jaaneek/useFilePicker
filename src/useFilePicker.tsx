import { useState, useCallback } from 'react';
import { fromEvent, FileWithPath } from 'file-selector';
import {
  UseFilePickerConfig,
  FileContent,
  FilePickerReturnTypes,
  FileError,
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
  const [fileErrors, setFileErrors] = useState<FileError[]>([]);
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
        reject: (reason: FileError) => void
      ) => {
        const reader = new FileReader();

        //availible reader methods: readAsText, readAsBinaryString, readAsArrayBuffer, readAsDataURL
        const readStrategy = reader[`readAs${readAs}` as ReaderMethod] as typeof reader.readAsText;
        readStrategy.call(reader, file);

        const addError = ({ name = file.name, ...others }: FileError) => {
          reject({ name, fileSizeToolarge: false, fileSizeTooSmall: false, ...others });
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
          addError({ readerError: reader.error, plainFile: file });
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
          (await Promise.all(
            validators.map(validator =>
              validator.validateBeforeParsing(props, plainFileObjects).catch((err: FileError) => err)
            )
          )) as FileError[]
        ).filter(Boolean);

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

        const validationsAfterParsing: FileError[] = [];
        const filesContent = (await Promise.all(
          files.map(file =>
            parseFile(file).catch(fileError => {
              fileError.plainFile = file;
              validationsAfterParsing.push(fileError);
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
