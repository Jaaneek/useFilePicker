import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { useFilePicker } from '../src';

const App = () => {
  const [filesContent, errors, openFileSelector] = useFilePicker({
    multiple: true,
    accept: '.ics,.pdf',
  });

  if (errors.length) {
    return (
      <div>
        <button onClick={() => openFileSelector()}>Something went wrong, retry! </button>
        {errors[0].fileSizeTooSmall && 'File size is too small!'}
        {errors[0].fileSizeToolarge && 'File size is too large!'}
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => openFileSelector()}>Select file </button>
      File names:
      {JSON.stringify(filesContent.map(x => x.name))}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
