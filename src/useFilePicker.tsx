import { useEffect, useRef, useState } from 'react';
import { fromEvent, FileWithPath } from 'file-selector';
import { UseFilePickerConfig, FileContent, FilePickerReturnTypes, FileError, ReaderMethod } from './interfaces';
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
}: UseFilePickerConfig): FilePickerReturnTypes {
  const [files, setFiles] = useState<FileWithPath[]>([]);
  const [filesContent, setFilesContent] = useState<FileContent[]>([]);
  const [fileErrors, setFileErrors] = useState<FileError[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [plainFiles, setPlainFiles] = useState<File[]>([]);
  const plainFileObjectsRef = useRef<File[]>([]);

  const openFileSelector = () => {
    const fileExtensions = accept instanceof Array ? accept.join(',') : accept;
    openFileDialog(fileExtensions, multiple, evt => {
      clear();
      const inputElement = evt.target as HTMLInputElement;
      plainFileObjectsRef.current = inputElement.files ? Array.from(inputElement.files) : [];
      const validations = VALIDATORS.concat(validators).map(validator =>
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
            },
            plainFileObjectsRef.current
          )
          .catch(err => Promise.reject(setFileErrors(f => [{ ...err, ...f }])))
      );

      Promise.all(validations).then(() => {
        if (!readFilesContent) {
          setPlainFiles(plainFileObjectsRef.current);
          return;
        }
        fromEvent(evt).then(files => {
          setFiles(files as FileWithPath[]);
        });
      });
    });
  };

  const clear = (): void => {
    setPlainFiles([]);
    setFiles([]);
    setFilesContent([]);
    setFileErrors([]);
  };

  useEffect(() => {
    if (files.length === 0) {
      setFilesContent([]);
      return;
    }
    setLoading(true);
    const fileParsingPromises = files.map(
      (file: FileWithPath) =>
        new Promise(async (resolve: (fileContent: FileContent) => void, reject: (reason: FileError) => void) => {
          const reader = new FileReader();

          //availible reader methods: readAsText, readAsBinaryString, readAsArrayBuffer, readAsDataURL
          const readStrategy = reader[`readAs${readAs}` as ReaderMethod] as typeof reader.readAsText;
          readStrategy.call(reader, file);

          const addError = ({ name = file.name, ...others }: FileError) => {
            reject({ name, fileSizeToolarge: false, fileSizeTooSmall: false, ...others });
          };

          reader.onload = async () => {
            const validations = VALIDATORS.concat(validators).map(validator =>
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
                  },
                  file,
                  reader
                )
                .catch(err => Promise.reject(addError(err)))
            );

            Promise.all(validations).then(() =>
              resolve({
                content: reader.result as string,
                name: file.name,
                lastModified: file.lastModified,
              } as FileContent)
            );
          };

          reader.onerror = () => {
            addError({ readerError: reader.error });
          };
        })
    );
    Promise.all(fileParsingPromises)
      .then((fileContent: FileContent[]) => {
        setFilesContent(fileContent);
        setPlainFiles(plainFileObjectsRef.current);
        setFileErrors([]);
      })
      .catch(err => {
        setFileErrors(f => [err, ...f]);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  return [openFileSelector, { filesContent, errors: fileErrors, loading, plainFiles, clear }];
}

export default useFilePicker;
