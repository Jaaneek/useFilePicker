import { useRef, useState, useCallback } from 'react';
import { fromEvent, FileWithPath } from 'file-selector';
import { UseFilePickerConfig, FileContent, FilePickerReturnTypes, FileError, ReaderMethod, OpenFilePickerFunction } from './interfaces';
import FileSizeValidator from './validators/fileSizeValidator';
import FilesLimitValidator from './validators/filesLimitValidator';
import { Validator } from './validators/validatorInterface';
import { openFileDialog } from './helpers/openFileDialog';
import ImageDimensionsValidator from './validators/imageDimensionsValidator';

const VALIDATORS: Validator[] = [new FileSizeValidator(), new FilesLimitValidator(), new ImageDimensionsValidator()];

function useFilePicker({
  accept = '*',
  multiple = true,
  readAs = 'Text',
  minFileSize,
  maxFileSize,
  imageSizeRestrictions,
  limitFilesConfig,
  readFilesContent = true,
  validators = [],
  initializeWithCustomParameters,
}: UseFilePickerConfig): FilePickerReturnTypes {
  const [filesContent, setFilesContent] = useState<FileContent[]>([]);
  const [fileErrors, setFileErrors] = useState<FileError[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [plainFiles, setPlainFiles] = useState<File[]>([]);
  const plainFileObjectsRef = useRef<File[]>([]);

  const clear: () => void = useCallback(() => {
    setPlainFiles([]);
    setFilesContent([]);
    setFileErrors([]);
  }, []);

  const parseFile = (file: FileWithPath) =>
    new Promise<FileContent>(async (resolve: (fileContent: FileContent) => void, reject: (reason: FileError) => void) => {
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
            validator
              .validateAfterParsing(
                {
                  accept,
                  multiple,
                  readAs,
                  minFileSize,
                  maxFileSize,
                  imageSizeRestrictions,
                  limitFilesConfig,
                  readFilesContent,
                  initializeWithCustomParameters,
                },
                file,
                reader
              )
              .catch(err => Promise.reject(addError(err)))
          )
        )
          .then(() =>
            resolve({
              ...file,
              content: reader.result as string,
              name: file.name,
              lastModified: file.lastModified,
            } as FileContent)
          )
          .catch(() => {});

      reader.onerror = () => {
        addError({ readerError: reader.error });
      };
    });

  const openFileSelector = async () => {
    const fileExtensions = accept instanceof Array ? accept.join(',') : accept;
    return new Promise<Awaited<ReturnType<OpenFilePickerFunction>>>((resolveFileSelection, rejectFileSelection) => {
      openFileDialog(
        fileExtensions,
        multiple,
        async evt => {
          clear();
          const inputElement = evt.target as HTMLInputElement;
          plainFileObjectsRef.current = inputElement.files ? Array.from(inputElement.files) : [];

          const validations = (
            (await Promise.all(
              VALIDATORS.concat(validators).map(validator =>
                validator
                  .validateBeforeParsing(
                    {
                      accept,
                      multiple,
                      readAs,
                      minFileSize,
                      maxFileSize,
                      imageSizeRestrictions,
                      limitFilesConfig,
                      readFilesContent,
                      initializeWithCustomParameters,
                    },
                    plainFileObjectsRef.current
                  )
                  .catch((err: FileError) => err)
              )
            ).catch(() => {})) as FileError[]
          ).filter(Boolean);

          setPlainFiles(plainFileObjectsRef.current);
          setFileErrors(validations.filter(Boolean));
          if (validations.length > 0) {
            rejectFileSelection(validations);
            return;
          }

          if (!readFilesContent) {
            resolveFileSelection({
              filesContent: [],
              errors: validations,
              plainFiles: plainFileObjectsRef.current,
            });
            return;
          }

          const files = (await fromEvent(evt)) as FileWithPath[];

          if (files.length === 0) {
            clear();
            resolveFileSelection({
              filesContent: [],
              errors: [],
              plainFiles: plainFileObjectsRef.current,
            });
            return;
          }

          setLoading(true);
          setFileErrors([]);
          const filesContent = await Promise.all(files.map(parseFile)).catch(err => {
            setFileErrors(f => [err, ...f]);
            return [];
          });
          setFilesContent(filesContent);
          setPlainFiles(plainFileObjectsRef.current);
          setLoading(false);

          resolveFileSelection({
            filesContent,
            errors: validations,
            plainFiles: plainFileObjectsRef.current,
          });
        },
        initializeWithCustomParameters
      );
    });
  };

  return [openFileSelector, { filesContent, errors: fileErrors, loading, plainFiles, clear }];
}

export default useFilePicker;
