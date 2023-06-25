import 'react-app-polyfill/ie11';
import * as React from 'react';
import { PersistentAmountOfFilesLimitValidator, useImperativeFilePicker } from '../src';

const Imperative = () => {
  // for imperative file picker, if you want to limit amount of files selected by user, you need to pass persistent validator
  const validators = React.useMemo(() => [new PersistentAmountOfFilesLimitValidator({ min: 2, max: 3 })], []);

  const { openFilePicker, filesContent, loading, errors, plainFiles, clear, removeFileByIndex, removeFileByReference } =
    useImperativeFilePicker({
      multiple: true,
      readAs: 'Text',
      readFilesContent: true,
      validators,
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
      Amount of filesContent:
      {filesContent.length}
      <br />
      {!!errors.length && (
        <>
          Errors:
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {console.log(errors)}
            {Object.entries(errors[0])
              .filter(([key, value]) => key !== 'name' && value)
              .map(([key]) => (
                <div key={key}>{key}</div>
              ))}
          </div>
        </>
      )}
      <br />
      {plainFiles.map((file, i) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center' }} key={file.name}>
            <div>{file.name}</div>
            <button style={{ marginLeft: 24 }} onClick={() => removeFileByReference(file)}>
              Remove by reference
            </button>
            <button style={{ marginLeft: 24 }} onClick={() => removeFileByIndex(i)}>
              Remove by index
            </button>
          </div>
          <div>{filesContent[i]?.content}</div>
        </div>
      ))}
    </div>
  );
};

export default Imperative;
