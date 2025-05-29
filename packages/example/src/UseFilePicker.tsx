/* eslint-disable @typescript-eslint/no-unused-vars */
import { useFilePicker } from 'use-file-picker';
import { Validator, ImageDimensionsValidator, FileAmountLimitValidator } from 'use-file-picker/validators';
import { type UseFilePickerConfig, type FileWithPath } from 'use-file-picker';
import { useState } from 'react';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
class CustomValidator extends Validator {
  /**
   * Validation takes place before parsing. You have access to config passed as argument to useFilePicker hook
   * and all plain file objects of selected files by user. Called once for all files after selection.
   * Example validator below allowes only even amount of files
   * @returns {Promise} resolve means that file passed validation, reject means that file did not pass
   */
  async validateBeforeParsing(_config: UseFilePickerConfig, plainFiles: File[]): Promise<void> {
    return new Promise((res, rej) => (plainFiles.length % 2 === 0 ? res(undefined) : rej({ oddNumberOfFiles: true })));
  }
  /**
   * Validation takes place after parsing (or is never called if readFilesContent is set to false).
   * You have access to config passed as argument to useFilePicker hook, FileWithPath object that is currently
   * being validated and the reader object that has loaded that file. Called individually for every file.
   * Example validator below allowes only if file hasn't been modified in last 24 hours
   * @returns {Promise} resolve means that file passed validation, reject means that file did not pass
   */
  async validateAfterParsing(_config: UseFilePickerConfig, file: FileWithPath, _reader: FileReader): Promise<void> {
    return new Promise((res, rej) =>
      file.lastModified < new Date().getTime() - 24 * 60 * 60 * 1000
        ? res(undefined)
        : rej({ fileRecentlyModified: true, lastModified: file.lastModified })
    );
  }
}

export const UseFilePicker = () => {
  const [selectionMode, setSelectionMode] = useState<'file' | 'dir'>('file');
  const { openFilePicker, filesContent, loading, errors, plainFiles, clear } = useFilePicker({
    multiple: true,
    readAs: 'Text', // availible formats: "Text" | "BinaryString" | "ArrayBuffer" | "DataURL"
    initializeWithCustomParameters(inputElement) {
      inputElement.webkitdirectory = selectionMode === 'dir';
      inputElement.addEventListener('cancel', () => {
        alert('cancel');
      });
    },
    // accept: ['.png', '.jpeg', '.heic'],
    // readFilesContent: false, // ignores file content,
    validators: [
      new FileAmountLimitValidator({ min: 1, max: 3 }),
      // new FileSizeValidator({ maxFileSize: 100_000 /* 100kb in bytes */ }),
      new ImageDimensionsValidator({ maxHeight: 600 }),
    ],
    onFilesSelected: ({ plainFiles, filesContent, errors }) => {
      // this callback is always called, even if there are errors
      console.log('onFilesSelected', plainFiles, filesContent, errors);
    },
    onFilesRejected: ({ errors }) => {
      // this callback is called when there were validation errors
      console.log('onFilesRejected', errors);
    },
    onFilesSuccessfullySelected: ({ plainFiles, filesContent }) => {
      // this callback is called when there were no validation errors
      console.log('onFilesSuccessfullySelected', plainFiles, filesContent);
    },
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <button onClick={() => setSelectionMode(selectionMode === 'file' ? 'dir' : 'file')}>
        {selectionMode === 'file' ? 'FILE' : 'DIR'}
      </button>
      <button onClick={async () => openFilePicker()}>Select file</button>
      <button onClick={() => clear()}>Clear</button>
      <br />
      Amount of selected files:
      {plainFiles.length}
      <br />
      {errors.length ? (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginTop: '10px' }}>Errors:</div>
          {errors.map((error, index) => (
            <div key={error.name}>
              <span>{index + 1}.</span>
              {Object.entries(error).map(([key, value]) => (
                <div key={key}>
                  {key}: {typeof value === 'string' ? value : Array.isArray(value) ? value.join(', ') : null}
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : null}
      {/* If readAs is set to DataURL, You can display an image */}
      {filesContent.length ? <img src={filesContent[0].content} /> : null}
      {filesContent.length ? <div>{filesContent[0].content}</div> : null}
      <br />
      {plainFiles.map(file => (
        <div key={crypto.randomUUID()}>{file.name}</div>
      ))}
    </div>
  );
};
