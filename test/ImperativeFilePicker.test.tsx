import React from 'react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { render, act, waitFor } from '@testing-library/react';
import { ImperativePicker } from '../stories/ImperativeFilePicker.stories';
import { invokeUseImperativeFilePicker, isInputElement } from './testUtils';

describe('DefaultPicker', () => {
  it('renders without crashing', async () => {
    const { findByRole } = render(<ImperativePicker />);
    const button = await findByRole('button');
    expect(button).toBeInTheDocument();
  });
});

describe('ImperativeFilePicker', () => {
  it('should keep selected files in state after new selection', async () => {
    const user = userEvent.setup();
    const { input, result } = invokeUseImperativeFilePicker({});

    const files = [
      new File(['hello'], 'hello.png', { type: 'image/png' }),
      new File(['there'], 'there.png', { type: 'image/png' }),
    ];
    await user.upload(input.current, files);

    await waitFor(() => result.current[1].loading === false);
    expect(result.current[1].plainFiles.length).toBe(2);

    act(() => {
      result.current[0]();
    });

    if (!isInputElement(input.current!)) throw new Error('Input not found');

    const newFile = [new File(['new'], 'new.png', { type: 'image/png' })];
    await user.upload(input.current, newFile);

    await waitFor(() => result.current[1].loading === false);
    expect(result.current[1].plainFiles.length).toBe(3);
  });

  it('should allow to remove files by index', async () => {
    const user = userEvent.setup();
    const { input, result } = invokeUseImperativeFilePicker({});

    const files = [
      new File(['hello'], 'hello.png', { type: 'image/png' }),
      new File(['there'], 'there.png', { type: 'image/png' }),
      new File(['new'], 'new.png', { type: 'image/png' }),
    ];
    await user.upload(input.current, files);

    await waitFor(() => result.current[1].loading === false);
    expect(result.current[1].plainFiles.length).toBe(3);

    act(() => {
      result.current[1].removeFileByIndex(1); // remove the second file
    });

    await waitFor(() => result.current[1].loading === false);
    expect(result.current[1].plainFiles.length).toBe(2);
    expect(result.current[1].plainFiles[0].name).toBe('hello.png');
    expect(result.current[1].plainFiles[1].name).toBe('new.png');
  });

  it('should allow to remove files by reference', async () => {
    const user = userEvent.setup();
    const { input, result } = invokeUseImperativeFilePicker({});

    const files = [
      new File(['hello'], 'hello.png', { type: 'image/png' }),
      new File(['there'], 'there.png', { type: 'image/png' }),
      new File(['new'], 'new.png', { type: 'image/png' }),
    ];
    await user.upload(input.current, files);

    await waitFor(() => result.current[1].loading === false);
    expect(result.current[1].plainFiles.length).toBe(3);

    act(() => {
      const fileToBeRemoved = result.current[1].plainFiles[1]; // remove the second file
      result.current[1].removeFileByReference(fileToBeRemoved); // remove the second file
    });

    await waitFor(() => result.current[1].loading === false);
    expect(result.current[1].plainFiles.length).toBe(2);
    expect(result.current[1].plainFiles[0].name).toBe('hello.png');
    expect(result.current[1].plainFiles[1].name).toBe('new.png');
  });

  it('should allow to clear the selection', async () => {
    const user = userEvent.setup();
    const { input, result } = invokeUseImperativeFilePicker({});

    const files = [
      new File(['hello'], 'hello.png', { type: 'image/png' }),
      new File(['there'], 'there.png', { type: 'image/png' }),
      new File(['new'], 'new.png', { type: 'image/png' }),
    ];
    await user.upload(input.current, files);

    await waitFor(() => result.current[1].loading === false);
    expect(result.current[1].plainFiles.length).toBe(3);

    act(() => {
      result.current[1].clear();
    });

    await waitFor(() => result.current[1].loading === false);
    expect(result.current[1].plainFiles.length).toBe(0);
  });
});
