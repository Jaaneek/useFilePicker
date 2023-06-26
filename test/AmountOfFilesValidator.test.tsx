import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { waitFor } from '@testing-library/react';
import { invokeUseFilePicker } from './testUtils';
import { FileAmountLimitValidator } from '../src';

describe('AmountOfFilesRestrictions', () => {
  it('should not allow to put more files than maximum specified', async () => {
    const validators = [new FileAmountLimitValidator({ max: 3 })];
    const { input, result } = invokeUseFilePicker({ validators });

    const files = [new File([''], 'file1'), new File([''], 'file2'), new File([''], 'file3'), new File([''], 'file4')];
    await userEvent.upload(input.current!, files);

    await waitFor(() => result.current.loading === false);
    if (result.current.errors[0].name === 'FileAmountLimitError') {
      expect(result.current.errors[0].reason === 'MAX_AMOUNT_OF_FILES_EXCEEDED').toBe(true);
    } else {
      fail('Expected FileAmountLimitError');
    }
  });

  it('should allow to put less files than maximum specified', async () => {
    const validators = [new FileAmountLimitValidator({ max: 3 })];
    const { input, result } = invokeUseFilePicker({ validators });

    const files = [new File([''], 'file1'), new File([''], 'file2')];
    await userEvent.upload(input.current!, files);

    await waitFor(() => result.current.loading === false);
    expect(result.current.errors.length).toBe(0);
    expect(result.current.plainFiles.length).toBe(2);
  });

  it('should allow to put more files than minimum specified', async () => {
    const validators = [new FileAmountLimitValidator({ min: 3 })];
    const { input, result } = invokeUseFilePicker({ validators });

    const files = [new File([''], 'file1'), new File([''], 'file2'), new File([''], 'file3'), new File([''], 'file4')];
    await userEvent.upload(input.current!, files);

    await waitFor(() => result.current.loading === false);
    expect(result.current.plainFiles.length).toBe(4);
  });

  it('should not allow to put less files than minimum specified', async () => {
    const validators = [new FileAmountLimitValidator({ min: 3 })];
    const { input, result } = invokeUseFilePicker({ validators });

    const files = [new File([''], 'file1'), new File([''], 'file2')];
    await userEvent.upload(input.current!, files);

    await waitFor(() => result.current.loading === false);
    if (result.current.errors[0].name === 'FileAmountLimitError') {
      expect(result.current.errors[0].reason === 'MIN_AMOUNT_OF_FILES_NOT_REACHED').toBe(true);
    } else {
      fail('Expected FileAmountLimitError');
    }
  });
});
