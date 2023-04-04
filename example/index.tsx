import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { useFilePicker } from '../src';
import type { Validator } from '../src';

const customValidator: Validator = {
  /**
   * Validation takes place before parsing. You have access to config passed as argument to useFilePicker hook
   * and all plain file objects of selected files by user. Called once for all files after selection.
   * Example validator below allowes only even amount of files
   * @returns {Promise} resolve means that file passed validation, reject means that file did not pass
   */
  validateBeforeParsing: async (config, plainFiles) =>
    new Promise((res, rej) => (plainFiles.length % 2 === 0 ? res(undefined) : rej({ oddNumberOfFiles: true }))),
  /**
   * Validation takes place after parsing (or is never called if readFilesContent is set to false).
   * You have access to config passed as argument to useFilePicker hook, FileWithPath object that is currently
   * being validated and the reader object that has loaded that file. Called individually for every file.
   * Example validator below allowes only if file hasn't been modified in last 24 hours
   * @returns {Promise} resolve means that file passed validation, reject means that file did not pass
   */
  validateAfterParsing: async (config, file, reader) =>
    new Promise((res, rej) =>
      file.lastModified < new Date().getTime() - 24 * 60 * 60 * 1000
        ? res(undefined)
        : rej({ fileRecentlyModified: true, lastModified: file.lastModified })
    ),
};

const App = () => {
  const [openFileSelector, { filesContent, loading, errors, plainFiles, clear }] = useFilePicker({
    multiple: true,
    readAs: 'DataURL', // availible formats: "Text" | "BinaryString" | "ArrayBuffer" | "DataURL"
    // accept: '.ics,.pdf',
    accept: ['.png', '.jpeg', '.heic'],
    limitFilesConfig: { min: 2, max: 3 },
    // minFileSize: 1, // in megabytes
    // maxFileSize: 1,
    // imageSizeRestrictions: {
    //   maxHeight: 1024, // in pixels
    //   maxWidth: 1024,
    //   minHeight: 768,
    //   minWidth: 768,
    // },
    // readFilesContent: false, // ignores file content,
    // validators: [customValidator],
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

  if (errors.length) {
    return (
      <div>
        <button onClick={() => openFileSelector()}>Something went wrong, retry! </button>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {console.log(errors)}
          {Object.entries(errors[0])
            .filter(([key, value]) => key !== 'name' && value)
            .map(([key]) => (
              <div key={key}>{key}</div>
            ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <button onClick={async () => openFileSelector()}>Select file</button>
      <button onClick={() => clear()}>Clear</button>
      <br />
      Number of selected files:
      {plainFiles.length}
      <br />
      {/* If readAs is set to DataURL, You can display an image */}
      {!!filesContent.length && <img src={filesContent[0].content} />}
      <br />
      {plainFiles.map(file => (
        <div key={file.name}>{file.name}</div>
      ))}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
