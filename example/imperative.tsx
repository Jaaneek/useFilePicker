import 'react-app-polyfill/ie11';
import * as React from 'react';
import { useImperativeFilePicker } from '../src';
import { PersistentFileAmountLimitValidator } from '../src/validators';

const Imperative = () => {
  // for imperative file picker, if you want to limit amount of files selected by user, you need to pass persistent validator
  const validators = React.useMemo(() => [new PersistentFileAmountLimitValidator({ min: 2, max: 3 })], []);

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
