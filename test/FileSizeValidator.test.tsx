import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
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

    if (result.current.errors[0].name === 'FileSizeError') {
      expect(result.current.errors[0].reason === 'FILE_SIZE_TOO_LARGE').toBe(true);
    } else {
      fail('Expected FileSizeError');
    }
  });

  it('should check minimum file size', async () => {
    const validators = [new FileSizeValidator({ minFileSize: 1_000_000 })]; // 1MB
    const { input, result } = invokeUseFilePicker({ validators });

    const bigFile = createFileOfSize(0);
    await userEvent.upload(input.current!, bigFile);

    await waitFor(() => result.current.loading === false);
    if (result.current.errors[0].name === 'FileSizeError') {
      expect(result.current.errors[0].reason === 'FILE_SIZE_TOO_SMALL').toBe(true);
    } else {
      fail('Expected FileSizeError');
    }
  });
});
