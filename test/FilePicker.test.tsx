import React from 'react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { render, waitFor } from '@testing-library/react';
import { DefaultPicker } from '../stories/FilePicker.stories';
import { invokeUseFilePicker } from './testUtils';

describe('DefaultPicker', () => {
  it('renders without crashing', async () => {
    const { findByRole } = render(<DefaultPicker />);
    const button = await findByRole('button');
    expect(button).toBeInTheDocument();
  });
});

describe('DefaultPicker', () => {
  it('should upload files correctly', async () => {
    const user = userEvent.setup();
    const { input, result } = invokeUseFilePicker({});

    const files = [
      new File(['hello'], 'hello.png', { type: 'image/png' }),
      new File(['there'], 'there.png', { type: 'image/png' }),
    ];
    await user.upload(input.current!, files);

    await waitFor(() => result.current.loading === false);

    expect(result.current.plainFiles.length).toBe(2);
    expect(input.current!.files).toHaveLength(2);
    expect(input.current!.files?.[0]).toStrictEqual(files[0]);
    expect(input.current!.files?.[1]).toStrictEqual(files[1]);
  });
});
