import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { useFilePicker } from '../src';

const App = () => {
  const [filesContent, errors, openFileSelector, loading] = useFilePicker({
    multiple: true,
    // accept: '.ics,.pdf',
    accept: ['.json', '.pdf'],
  });

  if (errors.length) {
    return (
      <div>
        <button onClick={() => openFileSelector()}>Something went wrong, retry! </button>
        {errors[0].fileSizeTooSmall && 'File size is too small!'}
        {errors[0].fileSizeToolarge && 'File size is too large!'}
        {errors[0].readerError && 'Problem occured while reading file!'}
      </div>
    );
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <button onClick={() => openFileSelector()}>Select file </button>
      <br />
      Number of selected files:
      {filesContent.length}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
