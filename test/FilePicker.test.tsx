import React from 'react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { DefaultPicker } from '../stories/FilePicker.stories';
import { useFilePicker } from '../src/index';

describe('DefaultPicker', () => {
  it('renders without crashing', async () => {
    const { findByRole } = render(<DefaultPicker />);
    const button = await findByRole('button');
    expect(button).toBeInTheDocument();
  });
});

const isInputElement = (el: HTMLElement): el is HTMLInputElement => el instanceof HTMLInputElement;

const SomeRandomComponent = () => {
  const [openFileSelector, { plainFiles, loading, errors }] = useFilePicker({
    accept: '*',
    multiple: true,
    initializeWithCustomParameters: input => input.setAttribute('data-testid', 'tested'),
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

describe('DefaultPicker', () => {
  it('should upload files correctly', async () => {
    const user = userEvent.setup();
    render(<SomeRandomComponent></SomeRandomComponent>);
    // get the upload button
    let uploader = screen.getByRole('button', {});
    await user.click(uploader);

    let input = screen.getByTestId('tested');

    if (!isInputElement(input)) throw new Error('Input not found');

    const files = [
      new File(['hello'], 'hello.png', { type: 'image/png' }),
      new File(['there'], 'there.png', { type: 'image/png' }),
    ];
    await user.upload(input, files);

    expect(screen.queryByTestId('tested')).not.toBeInTheDocument();
    await waitForElementToBeRemoved(() => screen.queryByText(/loading.../i));
    await screen.findByText(/files length : 2/i);

    expect(input.files).toHaveLength(2);
    expect(input.files).toBeTruthy();
    expect(input.files?.[0]).toStrictEqual(files[0]);
    expect(input.files?.[1]).toStrictEqual(files[1]);
  });
});
