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
import FileSizeValidator from './validators/fileSizeValidator';
import FilesLimitValidator from './validators/filesLimitValidator';
import { Validator } from './validators/validatorInterface';
import { openFileDialog } from './helpers/openFileDialog';
import ImageDimensionsValidator from './validators/imageDimensionsValidator';

const VALIDATORS: Validator[] = [new FileSizeValidator(), new FilesLimitValidator(), new ImageDimensionsValidator()];

function useFilePicker<ConfigType extends UseFilePickerConfig>(
  props: ConfigType
): FilePickerReturnTypes<ExtractContentTypeFromConfig<ConfigType>> {
  const {
    accept = '*',
    multiple = true,
    readAs = 'Text',
    readFilesContent = true,
    validators = [],
    onFilesSelected,
    onFilesSuccessfulySelected,
    onFilesRejected,
    initializeWithCustomParameters,
  } = props;
  const [plainFiles, setPlainFiles] = useState<File[]>([]);
  const [filesContent, setFilesContent] = useState<FileContent<ExtractContentTypeFromConfig<ConfigType>>[]>([]);
  const [fileErrors, setFileErrors] = useState<FileError[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const clear: () => void = useCallback(() => {
    setPlainFiles([]);
    setFilesContent([]);
    setFileErrors([]);
  }, []);

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
            VALIDATORS.concat(validators).map(validator =>
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

  const openFileSelector = () => {
    const fileExtensions = accept instanceof Array ? accept.join(',') : accept;
    openFileDialog(
      fileExtensions,
      multiple,
      async evt => {
        clear();
        const inputElement = evt.target as HTMLInputElement;
        const plainFileObjects = inputElement.files ? Array.from(inputElement.files) : [];

        setLoading(true);

        const validations = (
          (await Promise.all(
            VALIDATORS.concat(validators).map(validator =>
              validator.validateBeforeParsing(props, plainFileObjects).catch((err: FileError) => err)
            )
          )) as FileError[]
        ).filter(Boolean);

        setPlainFiles(plainFileObjects);
        setFileErrors(validations);
        if (validations.length) {
          setLoading(false);
          onFilesRejected?.({ errors: validations });
          onFilesSelected?.({ errors: validations });
          return;
        }

        if (!readFilesContent) {
          setLoading(false);
          onFilesSelected?.({ plainFiles: plainFileObjects, filesContent: [] });
          return;
        }

        const files = (await fromEvent(evt)) as FileWithPath[];

        const fileErrors: FileError[] = [];
        const filesContent = (await Promise.all(
          files.map(file =>
            parseFile(file).catch(fileError => {
              fileError.plainFile = file;
              fileErrors.push(fileError);
            })
          )
        )) as FileContent<ExtractContentTypeFromConfig<ConfigType>>[];
        setLoading(false);

        if (fileErrors.length) {
          setPlainFiles([]);
          setFilesContent([]);
          setFileErrors(errors => [...errors, ...fileErrors]);
          onFilesRejected?.({ errors: fileErrors });
          onFilesSelected?.({
            errors: validations.concat(fileErrors),
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

  return [openFileSelector, { filesContent, errors: fileErrors, loading, plainFiles, clear }];
}

export default useFilePicker;
