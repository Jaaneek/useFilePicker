import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { waitFor } from '@testing-library/react';
import { createFileOfSize, invokeUseFilePicker } from './testUtils';

describe('FileRestrictions', () => {
  it('should check maximum file size', async () => {
    const { input, result } = invokeUseFilePicker({ maxFileSize: 2 });

    const bigFile = createFileOfSize(10240 * 1024);
    await userEvent.upload(input.current!, bigFile);

    await waitFor(() => result.current[1].loading === false);

    expect(result.current[1].errors[0].fileSizeToolarge).toBe(true);
  });

  it('should check minimum file size', async () => {
    const { input, result } = invokeUseFilePicker({ minFileSize: 1 });

    const bigFile = createFileOfSize(0);
    await userEvent.upload(input.current!, bigFile);

    await waitFor(() => result.current[1].loading === false);
    expect(result.current[1].errors[0].fileSizeTooSmall).toBe(true);
  });

  it('should not allow to put more files than maximum specified', async () => {
    const { input, result } = invokeUseFilePicker({ limitFilesConfig: { max: 3 } });

    const files = [new File([''], 'file1'), new File([''], 'file2'), new File([''], 'file3'), new File([''], 'file4')];
    await userEvent.upload(input.current!, files);

    await waitFor(() => result.current[1].loading === false);
    expect(result.current[1].errors[0].maxLimitExceeded).toBe(true);
  });

  it('should allow to put less files than maximum specified', async () => {
    const { input, result } = invokeUseFilePicker({ limitFilesConfig: { max: 3 } });

    const files = [new File([''], 'file1'), new File([''], 'file2')];
    await userEvent.upload(input.current!, files);

    await waitFor(() => result.current[1].loading === false);
    expect(result.current[1].errors.length).toBe(0);
    expect(result.current[1].plainFiles.length).toBe(2);
  });

  it('should allow to put more files than minimum specified', async () => {
    const { input, result } = invokeUseFilePicker({ limitFilesConfig: { min: 3 } });

    const files = [new File([''], 'file1'), new File([''], 'file2'), new File([''], 'file3'), new File([''], 'file4')];
    await userEvent.upload(input.current!, files);

    await waitFor(() => result.current[1].loading === false);
    expect(result.current[1].plainFiles.length).toBe(4);
  });

  it('should not allow to put less files than minimum specified', async () => {
    const { input, result } = invokeUseFilePicker({ limitFilesConfig: { min: 3 } });

    const files = [new File([''], 'file1'), new File([''], 'file2')];
    await userEvent.upload(input.current!, files);

    await waitFor(() => result.current[1].loading === false);
    expect(result.current[1].errors[0].minLimitNotReached).toBe(true);
  });
});
