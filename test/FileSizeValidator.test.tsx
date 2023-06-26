import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { waitFor } from '@testing-library/react';
import { createFileOfSize, invokeUseFilePicker } from './testUtils';
import { FileSizeValidator } from '../src';

describe('FileSizeRestrictions', () => {
  it('should check maximum file size', async () => {
    const validators = [new FileSizeValidator({ maxFileSize: 8_000_000 })]; // 8MB
    const { input, result } = invokeUseFilePicker({ validators });

    const bigFile = createFileOfSize(10240 * 1024);
    await userEvent.upload(input.current!, bigFile);

    await waitFor(() => result.current.loading === false);

    expect(result.current.errors[0].fileSizeToolarge).toBe(true);
  });

  it('should check minimum file size', async () => {
    const validators = [new FileSizeValidator({ minFileSize: 1_000_000 })]; // 1MB
    const { input, result } = invokeUseFilePicker({ validators });

    const bigFile = createFileOfSize(0);
    await userEvent.upload(input.current!, bigFile);

    await waitFor(() => result.current.loading === false);
    expect(result.current.errors[0].fileSizeTooSmall).toBe(true);
  });
});
