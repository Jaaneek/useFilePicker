import { userEvent } from '@testing-library/user-event';
import { waitFor } from '@testing-library/react';
import { createFileOfSize, invokeUseFilePicker } from './testUtils.js';
import { FileTypeValidator } from '../src/validators.js';
import { describe, expect, it } from 'vitest';

describe('FileTypeValidator', () => {
  it('should allow to select desired file extension', async () => {
    const validators = [new FileTypeValidator(['txt'])];
    const { input, result } = invokeUseFilePicker({ validators });

    const file = createFileOfSize(1024);
    await userEvent.upload(input.current!, file);

    await waitFor(() => result.current.loading === false);

    expect(result.current.plainFiles.length).toBe(1);
  });

  it('should reject a file with an extension that is not listed', async () => {
    const validators = [new FileTypeValidator(['.nonexistent'])];
    const { input, result } = invokeUseFilePicker({ validators });

    const file = createFileOfSize(1024);
    await userEvent.upload(input.current!, file);

    await waitFor(() => result.current.loading === false);

    expect(result.current.plainFiles.length).toBe(0);
    if (result.current.errors[0]?.name === 'FileTypeError') {
      expect(result.current.errors[0]?.reason === 'FILE_TYPE_NOT_ACCEPTED').toBe(true);
    } else {
      throw new Error('Expected FileTypeError');
    }
  });
});
