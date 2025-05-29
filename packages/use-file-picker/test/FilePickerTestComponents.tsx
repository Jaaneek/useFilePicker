import React from 'react';
import { useFilePicker, useImperativeFilePicker } from '../src/index.js';
import { type FileContent, type ReadType, type UseFilePickerConfig } from '../src/types.js';

const renderDependingOnReaderType = (file: FileContent<string>, readAs: ReadType) => {
  switch (readAs) {
    case 'DataURL':
      return (
        <div style={{ margin: '8px' }}>
          success! <br />
          File name: {file.name}
          <br />
          Image:
          <br />
          <img alt={file.name} src={file.content} />
        </div>
      );
    default:
      return (
        <div style={{ margin: '8px' }}>
          success! <br />
          File name: {file.name}
          <br />
          content:
          <br />
          {file.content}
        </div>
      );
  }
};

export const FilePickerComponent = (props: UseFilePickerConfig) => {
  const { openFilePicker, filesContent, errors, plainFiles, loading } = useFilePicker({ ...props });

  return (
    <>
      {loading && <h1>Loading...</h1>}
      {errors.length ? (
        <div>
          errors:
          <br />
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
      <br />
      <button onClick={openFilePicker}>Open File Picker</button>
      {filesContent?.map(file => (file ? renderDependingOnReaderType(file, props.readAs!) : null))}
      {plainFiles?.map(file => (
        <div key={file.name} style={{ margin: '8px' }}>
          File name: {file.name}
          <br />
          File size: {file.size} bytes
          <br />
          File type: {file.type}
          <br />
          Last modified: {new Date(file.lastModified).toISOString()}
        </div>
      ))}
    </>
  );
};

export const ImperativeFilePickerComponent = (props: UseFilePickerConfig) => {
  const { openFilePicker, filesContent, errors, plainFiles, loading } = useImperativeFilePicker({ ...props });

  return (
    <>
      {loading && <h1>Loading...</h1>}
      {errors.length ? (
        <div>
          errors:
          <br />
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
      <br />
      <button onClick={openFilePicker}>Open File Picker</button>
      {filesContent?.map(file => (file ? renderDependingOnReaderType(file, props.readAs!) : null))}
      {plainFiles?.map(file => (
        <div key={file.name} style={{ margin: '8px' }}>
          File name: {file.name}
          <br />
          File size: {file.size} bytes
          <br />
          File type: {file.type}
          <br />
          Last modified: {new Date(file.lastModified).toISOString()}
        </div>
      ))}
    </>
  );
};
