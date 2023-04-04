import React from 'react';
import userEvent from '@testing-library/user-event';
import { useFilePicker, UseFilePickerConfig, Validator } from '../src/index';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import '@testing-library/jest-dom';
const isInputElement = (el: HTMLElement): el is HTMLInputElement => el instanceof HTMLInputElement;

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

const filenameValidator: Validator = {
  validateBeforeParsing: async (_, plainFiles) =>
    new Promise((res, rej) => {
      plainFiles.every(file => file.name.toLowerCase().startsWith('tryhards')) ? res() : rej({ filenameNotTryhards: true });
    }),
  validateAfterParsing: async () => Promise.resolve(),
};

const lastModifiedValidator: Validator = {
  validateBeforeParsing: async () => Promise.resolve(),
  validateAfterParsing: async (_, file) =>
    new Promise((res, rej) =>
      file.lastModified < new Date().getTime() - 24 * 60 * 60 * 1000 ? res() : rej({ fileRecentlyModified: true, lastModified: file.lastModified })
    ),
};

describe('Custom Validators', () => {
  it("should show error if all filenames dont start with 'tryhards'", async () => {
    const user = userEvent.setup();
    render(<TestComponent validators={[filenameValidator]}></TestComponent>);
    // get the upload button
    let uploader = screen.getByRole('button', {});
    await user.click(uploader);

    let input = screen.getByTestId('tested');

    if (!isInputElement(input)) throw new Error('Input not found');

    const files = [new File(['hello'], 'hello.png', { type: 'image/png' }), new File(['there'], 'there.png', { type: 'image/png' })];
    await user.upload(input, files);
    expect(screen.queryByTestId('tested')).not.toBeInTheDocument();
    expect(screen.getByText(/filenameNotTryhards/i)).toBeInTheDocument();
  });

  it("should work if all filenames start with 'tryhards'", async () => {
    const user = userEvent.setup();
    render(<TestComponent validators={[filenameValidator]}></TestComponent>);
    // get the upload button
    let uploader = screen.getByRole('button', {});
    await user.click(uploader);

    let input = screen.getByTestId('tested');

    if (!isInputElement(input)) throw new Error('Input not found');

    const files = [
      new File(['hello'], 'tryhards123.png', { type: 'image/png' }),
      new File(['there'], 'tryhardsRecruitementActive.png', {
        type: 'image/png',
      }),
    ];

    await user.upload(input, files);
    expect(screen.queryByTestId('tested')).not.toBeInTheDocument();
    await waitForElementToBeRemoved(() => screen.queryByText(/Loading/i));
    expect(screen.getByText(/files length : 2/i)).toBeInTheDocument();
  });
  it('should show error if any file was modified recently', async () => {
    const user = userEvent.setup();
    render(<TestComponent validators={[lastModifiedValidator]}></TestComponent>);
    // get the upload button
    let uploader = screen.getByRole('button', {});
    await user.click(uploader);

    let input = screen.getByTestId('tested');

    if (!isInputElement(input)) throw new Error('Input not found');

    const files = [
      new File(['hello'], 'tryhards123.png', {
        type: 'image/png',
        lastModified: new Date().getTime(),
      }),
      new File(['there'], 'tryhardsOpPlsJoin.png', {
        type: 'image/png',
        lastModified: new Date().getTime() - 24 * 60 * 60 * 1000,
      }),
    ];

    await user.upload(input, files);
    expect(screen.queryByTestId('tested')).not.toBeInTheDocument();
    await waitForElementToBeRemoved(() => screen.queryByText(/Loading/i));
    expect(screen.getByText(/fileRecentlyModified/i)).toBeInTheDocument();
  });
  it('should work if all files were modified more than a day ago', async () => {
    const user = userEvent.setup();
    render(<TestComponent validators={[lastModifiedValidator]}></TestComponent>);
    // get the upload button
    let uploader = screen.getByRole('button', {});
    await user.click(uploader);

    let input = screen.getByTestId('tested');

    if (!isInputElement(input)) throw new Error('Input not found');

    const files = [
      new File(['hello'], 'tryhards123.png', {
        type: 'image/png',
        lastModified: new Date().getTime() - 24 * 60 * 60 * 1000 - 1000,
      }),
      new File(['there'], 'tryhardsOpPlsJoin.png', {
        type: 'image/png',
        lastModified: new Date().getTime() - 24 * 60 * 60 * 1000 - 1000,
      }),
    ];

    await user.upload(input, files);
    expect(screen.queryByTestId('tested')).not.toBeInTheDocument();
    await waitForElementToBeRemoved(() => screen.queryByText(/Loading/i));
    expect(screen.getByText(/files length : 2/i)).toBeInTheDocument();
  });
});
