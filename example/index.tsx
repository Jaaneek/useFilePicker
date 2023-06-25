import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { useFilePicker, FileSizeValidator, AmountOfFilesLimitValidator, UseFilePickerConfig } from '../src';
import { Validator } from '../src';
import Imperative from './imperative';
import { FileWithPath } from 'file-selector';

class CustomValidator extends Validator {
  /**
   * Validation takes place before parsing. You have access to config passed as argument to useFilePicker hook
   * and all plain file objects of selected files by user. Called once for all files after selection.
   * Example validator below allowes only even amount of files
   * @returns {Promise} resolve means that file passed validation, reject means that file did not pass
   */
  async validateBeforeParsing(config: UseFilePickerConfig, plainFiles: File[]): Promise<void> {
    return new Promise((res, rej) => (plainFiles.length % 2 === 0 ? res(undefined) : rej({ oddNumberOfFiles: true })));
  }
  /**
   * Validation takes place after parsing (or is never called if readFilesContent is set to false).
   * You have access to config passed as argument to useFilePicker hook, FileWithPath object that is currently
   * being validated and the reader object that has loaded that file. Called individually for every file.
   * Example validator below allowes only if file hasn't been modified in last 24 hours
   * @returns {Promise} resolve means that file passed validation, reject means that file did not pass
   */
  async validateAfterParsing(config: UseFilePickerConfig, file: FileWithPath, reader: FileReader): Promise<void> {
    return new Promise((res, rej) =>
      file.lastModified < new Date().getTime() - 24 * 60 * 60 * 1000
        ? res(undefined)
        : rej({ fileRecentlyModified: true, lastModified: file.lastModified })
    );
  }
}

const App = () => {
  const { openFilePicker, filesContent, loading, errors, plainFiles, clear } = useFilePicker({
    multiple: true,
    readAs: 'DataURL', // availible formats: "Text" | "BinaryString" | "ArrayBuffer" | "DataURL"
    accept: ['.png', '.jpeg', '.heic'],
    // readFilesContent: false, // ignores file content,
    validators: [
      new AmountOfFilesLimitValidator({ min: 1, max: 3 }),
      new FileSizeValidator({ maxFileSize: 100_000 /* 100kb in bytes */ }),
    ],
    onFilesSelected: ({ plainFiles, filesContent, errors }) => {
      // this callback is always called, even if there are errors
      console.log('onFilesSelected', plainFiles, filesContent, errors);
    },
    onFilesRejected: ({ errors }) => {
      // this callback is called when there were validation errors
      console.log('onFilesRejected', errors);
    },
    onFilesSuccessfulySelected: ({ plainFiles, filesContent }) => {
      // this callback is called when there were no validation errors
      console.log('onFilesSuccessfulySelected', plainFiles, filesContent);
    },
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <button onClick={async () => openFilePicker()}>Select file</button>
      <button onClick={() => clear()}>Clear</button>
      <br />
      Amount of selected files:
      {plainFiles.length}
      <br />
      {errors.length ? (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginTop: '10px' }}>Errors:</div>
          {Object.entries(errors[0])
            .filter(([key, value]) => key !== 'name' && value)
            .map(([key]) => (
              <div key={key}>{key}</div>
            ))}
        </div>
      ) : null}
      {/* If readAs is set to DataURL, You can display an image */}
      {!!filesContent.length ? <img src={filesContent[0].content} /> : null}
      <br />
      {plainFiles.map(file => (
        <div key={file.name}>{file.name}</div>
      ))}
    </div>
  );
};

ReactDOM.render(
  <>
    <h2>useFilePicker</h2>
    {/* <App /> */}
    <h2>useImperativeFilePicker</h2>
    <Imperative />
    <Imperative />
  </>,
  document.getElementById('root')
);
