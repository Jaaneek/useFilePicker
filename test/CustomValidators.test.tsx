import React from 'react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { useFilePicker, UseFilePickerConfig } from '../src/index';

const isInputElement = (el: HTMLElement): el is HTMLInputElement => el instanceof HTMLInputElement;
function createBigFile(sizeInBytes: number) {
  const content = new ArrayBuffer(sizeInBytes);
  const file = new File([content], 'bigFile.txt', { type: 'text/plain' });
  return file;
}
const TestComponent = (filePickerProps?: UseFilePickerConfig) => {
  const [openFileSelector, { plainFiles, loading, errors }] = useFilePicker({
    accept: '*',
    readAs: 'DataURL',
    initializeWithCustomParameters: input => input.setAttribute('data-testid', 'tested'),
    ...filePickerProps,
  });
  return (
    <div>
      <button
        onClick={() => {
          openFileSelector();
        }}
      >
        Click me
      </button>
      <h2>Files length : {plainFiles.length}</h2>
      {loading && <h1>Loading...</h1>}
      {errors.length ? (
        <div>
          errors:
          <br />
          {Object.entries(errors[0])
            .filter(([, value]) => value === true)
            .map(([key]) => key)
            .map(key => (
              <div key={key} style={{ color: 'red' }}>
                {key}
              </div>
            ))}
        </div>
      ) : null}
    </div>
  );
};

describe('FileRestrictions', () => {
  it('should check maximum file size', async () => {
    render(<TestComponent maxFileSize={2}></TestComponent>);

    let uploader = screen.getByRole('button', {});
    await userEvent.click(uploader);

    let input = screen.getByTestId('tested');

    if (!isInputElement(input)) throw new Error('Input not found');

    const bigFile = createBigFile(10240 * 1024);
    await userEvent.upload(input, bigFile);
    expect(screen.queryByTestId('tested')).not.toBeInTheDocument();
    expect(screen.getByText('fileSizeToolarge')).toBeInTheDocument();
  });
  it('should check minimum file size', async () => {
    render(<TestComponent minFileSize={1}></TestComponent>);

    let uploader = screen.getByRole('button', {});
    await userEvent.click(uploader);

    let input = screen.getByTestId('tested');

    if (!isInputElement(input)) throw new Error('Input not found');

    const bigFile = createBigFile(0);
    await userEvent.upload(input, bigFile);

    expect(screen.queryByTestId('tested')).not.toBeInTheDocument();
    expect(screen.getByText('fileSizeTooSmall')).toBeInTheDocument();
  });
  it('should not allow to put more files than specified', async () => {
    render(<TestComponent limitFilesConfig={{ max: 3 }}></TestComponent>);

    let uploader = screen.getByRole('button', {});
    await userEvent.click(uploader);

    let input = screen.getByTestId('tested');

    if (!isInputElement(input)) throw new Error('Input not found');

    const files = [new File([''], 'file1'), new File([''], 'file2'), new File([''], 'file3'), new File([''], 'file4')];
    await userEvent.upload(input, files);
    expect(screen.queryByTestId('tested')).not.toBeInTheDocument();
    expect(screen.getByText('maxLimitExceeded')).toBeInTheDocument();
  });
  it('should allow to put more files than specified', async () => {
    render(<TestComponent limitFilesConfig={{ min: 3 }}></TestComponent>);

    let uploader = screen.getByRole('button', {});
    await userEvent.click(uploader);

    let input = screen.getByTestId('tested');

    if (!isInputElement(input)) throw new Error('Input not found');

    const files = [new File([''], 'file1'), new File([''], 'file2'), new File([''], 'file3'), new File([''], 'file4')];
    await userEvent.upload(input, files);
    expect(screen.queryByTestId('tested')).not.toBeInTheDocument();
    await waitForElementToBeRemoved(() => screen.queryByText(/loading.../i));
    expect(screen.getByText(/Files length : 4/i)).toBeInTheDocument();
  });
  it('should not allow to put less files than specified', async () => {
    render(<TestComponent limitFilesConfig={{ min: 3 }}></TestComponent>);

    let uploader = screen.getByRole('button', {});
    await userEvent.click(uploader);

    let input = screen.getByTestId('tested');

    if (!isInputElement(input)) throw new Error('Input not found');

    const files = [new File([''], 'file1'), new File([''], 'file2')];
    await userEvent.upload(input, files);
    expect(screen.queryByTestId('tested')).not.toBeInTheDocument();
    expect(screen.getByText('minLimitNotReached')).toBeInTheDocument();
  });
  it('should allow to put less files than specified', async () => {
    render(<TestComponent limitFilesConfig={{ max: 3 }}></TestComponent>);

    let uploader = screen.getByRole('button', {});
    await userEvent.click(uploader);

    let input = screen.getByTestId('tested');

    if (!isInputElement(input)) throw new Error('Input not found');

    const files = [new File([''], 'file1'), new File([''], 'file2')];
    await userEvent.upload(input, files);

    expect(screen.queryByTestId('tested')).not.toBeInTheDocument();

    expect(screen.getByText(/Files length : 2/i)).toBeInTheDocument();
  });
});
