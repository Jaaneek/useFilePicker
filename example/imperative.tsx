import 'react-app-polyfill/ie11';
import * as React from 'react';
import { useImperativeFilePicker } from '../src';

const Imperative = () => {
  const [openFileSelector, { filesContent, loading, errors, plainFiles, clear, removeFileByIndex }] =
    useImperativeFilePicker({
      multiple: true,
      readAs: 'Text',
      readFilesContent: true,
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
      {!!filesContent.length && <div>{filesContent[0].content}</div>}
      <br />
      {plainFiles.map((file, i) => (
        <div style={{ display: 'flex', alignItems: 'center' }} key={file.name}>
          <div>{file.name}</div>
          <button style={{ marginLeft: 24 }} onClick={() => removeFileByIndex(i)}>
            X
          </button>
        </div>
      ))}
    </div>
  );
};

export default Imperative;
