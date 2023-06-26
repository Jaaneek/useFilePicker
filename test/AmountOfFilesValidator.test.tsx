import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { waitFor } from '@testing-library/react';
import { invokeUseFilePicker } from './testUtils';
import { AmountOfFilesLimitValidator } from '../src';

describe('AmountOfFilesRestrictions', () => {
  it('should not allow to put more files than maximum specified', async () => {
    const validators = [new AmountOfFilesLimitValidator({ max: 3 })];
    const { input, result } = invokeUseFilePicker({ validators });

    const files = [new File([''], 'file1'), new File([''], 'file2'), new File([''], 'file3'), new File([''], 'file4')];
    await userEvent.upload(input.current!, files);

    await waitFor(() => result.current.loading === false);
    expect(result.current.errors[0].maxLimitExceeded).toBe(true);
  });

  it('should allow to put less files than maximum specified', async () => {
    const validators = [new AmountOfFilesLimitValidator({ max: 3 })];
    const { input, result } = invokeUseFilePicker({ validators });

    const files = [new File([''], 'file1'), new File([''], 'file2')];
    await userEvent.upload(input.current!, files);

    await waitFor(() => result.current.loading === false);
    expect(result.current.errors.length).toBe(0);
    expect(result.current.plainFiles.length).toBe(2);
  });

  it('should allow to put more files than minimum specified', async () => {
    const validators = [new AmountOfFilesLimitValidator({ min: 3 })];
    const { input, result } = invokeUseFilePicker({ validators });

    const files = [new File([''], 'file1'), new File([''], 'file2'), new File([''], 'file3'), new File([''], 'file4')];
    await userEvent.upload(input.current!, files);

    await waitFor(() => result.current.loading === false);
    expect(result.current.plainFiles.length).toBe(4);
  });

  it('should not allow to put less files than minimum specified', async () => {
    const validators = [new AmountOfFilesLimitValidator({ min: 3 })];
    const { input, result } = invokeUseFilePicker({ validators });

    const files = [new File([''], 'file1'), new File([''], 'file2')];
    await userEvent.upload(input.current!, files);

    await waitFor(() => result.current.loading === false);
    expect(result.current.errors[0].minLimitNotReached).toBe(true);
  });
});
