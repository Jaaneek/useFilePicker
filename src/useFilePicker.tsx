import { useEffect, useState } from 'react';
import { fromEvent, FileWithPath } from 'file-selector';
import { UseFilePickerConfig, FileContent, FilePickerReturnTypes, FileError, ReaderMethod } from './interfaces';

function useFilePicker({
  accept = '*',
  multiple = true,
  readAs = 'Text',
  minFileSize,
  maxFileSize,
  limitFilesConfig,
  readFilesContent = true,
}: UseFilePickerConfig): FilePickerReturnTypes {
  const [files, setFiles] = useState<FileWithPath[]>([]);
  const [filesContent, setFilesContent] = useState<FileContent[]>([]);
  const [fileErrors, setFileErrors] = useState<FileError[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [plainFiles, setPlainFiles] = useState<File[]>([]);

  const openFileSelector = () => {
    const fileExtensions = accept instanceof Array ? accept.join(',') : accept;
    openFileDialog(fileExtensions, multiple, evt => {
      const inputElement = evt.target as HTMLInputElement;
      const plainFiles = inputElement.files ? Array.from(inputElement.files) : [];
      setPlainFiles(plainFiles);

      if (limitFilesConfig) {
        if (limitFilesConfig.max && plainFiles.length > limitFilesConfig.max) {
          setFileErrors(f => [{ maxLimitExceeded: true }, ...f]);
          return;
        }

        if (limitFilesConfig.min && plainFiles.length < limitFilesConfig.min) {
          setFileErrors(f => [{ minLimitNotReached: true }, ...f]);
          return;
        }
      }
      if (!readFilesContent) return;
      fromEvent(evt).then(files => {
        setFiles(files as FileWithPath[]);
      });
    });
  };

  const clear = () : void => {
    setPlainFiles([])
    setFiles([])
    setFilesContent([])
    setFileErrors([])
  }

  useEffect(() => {
    if (files.length === 0) {
      setFilesContent([]);
      return;
    }
    setLoading(true);
    const filePromises = files.map(
      (file: FileWithPath) =>
        new Promise((resolve: (fileContent: FileContent) => void, reject: (reason: FileError) => void) => {
          const reader = new FileReader();

          //availible reader methods: readAsText, readAsBinaryString, readAsArrayBuffer, readAsDataURL
          const readStrategy = reader[`readAs${readAs}` as ReaderMethod] as typeof reader.readAsText;
          readStrategy.call(reader, file);

          reader.onload = () => {
            if (minFileSize) {
              const minBytes = minFileSize * BYTES_PER_MEGABYTE;
              if (file.size < minBytes) {
                addError({ fileSizeTooSmall: true });
              }
            }
            if (maxFileSize) {
              const maxBytes = maxFileSize * BYTES_PER_MEGABYTE;
              if (file.size > maxBytes) {
                addError({ fileSizeToolarge: true });
              }
            }

            resolve({
              content: reader.result as string,
              name: file.name,
              lastModified: file.lastModified,
            } as FileContent);
          };

          reader.onerror = () => {
            addError({ readerError: reader.error });
          };

          const addError = ({ name = file.name, ...others }: FileError) => {
            reject({ name, fileSizeToolarge: false, fileSizeTooSmall: false, ...others });
          };
        })
    );
    Promise.all(filePromises)
      .then((fileContent: FileContent[]) => {
        setFilesContent(fileContent);
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

function openFileDialog(accept: string, multiple: boolean, callback: (arg: Event) => void) {
  // this function must be called from  a user
  // activation event (ie an onclick event)

  // Create an input element
  var inputElement = document.createElement('input');
  // Set its type to file
  inputElement.type = 'file';
  // Set accept to the file types you want the user to select.
  // Include both the file extension and the mime type
  inputElement.accept = accept;
  // Accept multiple files
  inputElement.multiple = multiple;
  // set onchange event to call callback when user has selected file
  inputElement.addEventListener('change', callback);
  // dispatch a click event to open the file dialog
  inputElement.dispatchEvent(new MouseEvent('click'));
}

//Const values
const BYTES_PER_MEGABYTE = 1000000;
