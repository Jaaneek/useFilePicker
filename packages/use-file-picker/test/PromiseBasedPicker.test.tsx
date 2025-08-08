import { waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createFileOfSize, invokeUseFilePicker, invokeUseImperativeFilePicker } from './testUtils.js';
import { userEvent } from '@testing-library/user-event';
import { FileTypeValidator } from '../src/validators.js';

describe('PromisedBasedUseFilePicker', () => {
  it('should return a promise from openFilePicker', async () => {
    const user = userEvent.setup();
    const { input, result } = invokeUseFilePicker({ doNotInvokeAutomatically: true });
    const promise = result.current.openFilePicker();

    expect(promise).toBeInstanceOf(Promise);

    await waitFor(() => result.current.loading === true);

    const files = [new File(['hello'], 'hello.png', { type: 'image/png' })];
    await user.upload(input.current!, files);

    await waitFor(() => result.current.loading === false);

    expect(result.current.plainFiles.length).toBe(1);
    expect(input.current!.files).toHaveLength(1);
    expect(input.current!.files?.[0]).toStrictEqual(files[0]);
    promise.then(result => {
      expect(result.plainFiles.length).toBe(1);
      expect(input.current!.files).toHaveLength(1);
      expect(input.current!.files?.[0]).toStrictEqual(files[0]);
    });
  });

  it('should also resolve the promise with empty arrays if the user cancels the selection', async () => {
    const { input, result } = invokeUseFilePicker({ doNotInvokeAutomatically: true });
    const promise = result.current.openFilePicker();

    expect(promise).toBeInstanceOf(Promise);

    await waitFor(() => result.current.loading === true);

    input.current?.dispatchEvent(new MouseEvent('cancel'));

    await waitFor(() => result.current.loading === false);

    promise.then(result => {
      expect(result.plainFiles.length).toBe(0);
      expect(result.filesContent.length).toBe(0);
      expect(result.errors.length).toBe(0);
    });
  });

  it('should resolve the promise with the cancellation error if the user cancels the selection and detectCancellation is set to promiseResultOnly', async () => {
    const { input, result } = invokeUseFilePicker({ doNotInvokeAutomatically: true });
    const promise = result.current.openFilePicker({ detectCancellation: 'promiseResultOnly' });

    expect(promise).toBeInstanceOf(Promise);

    await waitFor(() => result.current.loading === true);

    input.current?.dispatchEvent(new MouseEvent('cancel'));

    await waitFor(() => result.current.loading === false);

    promise.then(result => {
      expect(result.plainFiles.length).toBe(0);
      expect(result.filesContent.length).toBe(0);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0]?.name).toBe('SelectionCancelledError');
      if (result.errors[0]?.name === 'SelectionCancelledError') {
        expect(result.errors[0].reason).toBe('SELECTION_CANCELLED');
      } else {
        throw new Error('Expected SelectionCancelledError');
      }
    });

    await promise;

    // hook state doesn't show the error as user requested only the promise result to contain the error
    expect(result.current.errors.length).toBe(0);
  });

  it('should resolve the promise with the cancellation error and return the error from the hook state if the user cancels the selection and detectCancellation is set to promiseResultAndHookState', async () => {
    const { input, result } = invokeUseFilePicker({ doNotInvokeAutomatically: true });
    const promise = result.current.openFilePicker({ detectCancellation: 'promiseResultAndHookState' });

    expect(promise).toBeInstanceOf(Promise);

    await waitFor(() => result.current.loading === true);

    input.current?.dispatchEvent(new MouseEvent('cancel'));

    await waitFor(() => result.current.loading === false);

    promise.then(promiseResult => {
      expect(promiseResult.plainFiles.length).toBe(0);
      expect(promiseResult.filesContent.length).toBe(0);
      expect(promiseResult.errors.length).toBe(1);
      expect(promiseResult.errors[0]?.name).toBe('SelectionCancelledError');
      if (promiseResult.errors[0]?.name === 'SelectionCancelledError') {
        expect(promiseResult.errors[0].reason).toBe('SELECTION_CANCELLED');
      } else {
        throw new Error('Expected SelectionCancelledError');
      }
    });

    await waitFor(() => result.current.errors.length === 1);
    expect(result.current.errors[0]?.name).toBe('SelectionCancelledError');
    if (result.current.errors[0]?.name === 'SelectionCancelledError') {
      expect(result.current.errors[0].reason).toBe('SELECTION_CANCELLED');
    } else {
      throw new Error('Expected SelectionCancelledError');
    }
  });

  it('should respect overrides passed to openFilePicker', async () => {
    const { input, result } = invokeUseFilePicker({
      readFilesContent: false,
      doNotInvokeAutomatically: true,
    });

    const promise = result.current.openFilePicker({
      readFilesContent: true,
    });

    const files = [new File(['hello'], 'hello.png', { type: 'image/png' })];
    await userEvent.upload(input.current!, files);

    await waitFor(() => result.current.loading === false);

    const resultFromPromise = await promise;
    expect(resultFromPromise?.plainFiles.length).toBe(1);
    // this would be 0 but the override specified that we want to read the files content
    expect(resultFromPromise?.filesContent.length).toBe(1);

    expect(result.current.plainFiles.length).toBe(1);
    expect(result.current.filesContent.length).toBe(1);
    expect(input.current!.files).toHaveLength(1);
    expect(input.current!.files?.[0]).toStrictEqual(files[0]);
  });

  it('the promise result should contain errors when validation fails', async () => {
    const validators = [new FileTypeValidator(['.nonexistent'])];
    const { input, result } = invokeUseFilePicker({ validators, doNotInvokeAutomatically: true });

    const promise = result.current.openFilePicker();

    const file = createFileOfSize(1024);
    await userEvent.upload(input.current!, file);

    await waitFor(() => result.current.loading === false);

    const promiseResult = await promise;
    expect(promiseResult.errors.length).toBe(1);
    if (promiseResult.errors[0]?.name === 'FileTypeError') {
      expect(promiseResult.errors[0]?.reason === 'FILE_TYPE_NOT_ACCEPTED').toBe(true);
    } else {
      throw new Error('Expected FileTypeError');
    }

    expect(result.current.plainFiles.length).toBe(0);
    if (result.current.errors[0]?.name === 'FileTypeError') {
      expect(result.current.errors[0]?.reason === 'FILE_TYPE_NOT_ACCEPTED').toBe(true);
    } else {
      throw new Error('Expected FileTypeError');
    }
  });
});

describe('PromisedBasedImperativeUseFilePicker', () => {
  it('should return a promise from openFilePicker', async () => {
    const user = userEvent.setup();
    const { input, result } = invokeUseImperativeFilePicker({ doNotInvokeAutomatically: true });
    const promise = result.current.openFilePicker();

    expect(promise).toBeInstanceOf(Promise);

    await waitFor(() => result.current.loading === true);

    const files = [new File(['hello'], 'hello.png', { type: 'image/png' })];
    await user.upload(input.current!, files);

    await waitFor(() => result.current.loading === false);

    await waitFor(() => result.current.plainFiles.length === 1);

    expect(result.current.plainFiles.length).toBe(1);
    expect(input.current!.files).toHaveLength(1);
    expect(input.current!.files?.[0]).toStrictEqual(files[0]); // this is the file that was uploaded
    const promiseResult = await promise;
    expect(promiseResult.plainFiles.length).toBe(1);
    expect(promiseResult.plainFiles[0]).toStrictEqual(files[0]);

    const promise2 = result.current.openFilePicker();

    await waitFor(() => result.current.loading === true);

    const files2 = [new File(['hello2'], 'hello2.png', { type: 'image/png' })];
    await user.upload(input.current!, files2);

    await waitFor(() => result.current.loading === false);

    await waitFor(() => result.current.plainFiles.length === 2);

    const promiseResult2 = await promise2;

    expect(result.current.plainFiles.length).toBe(2);
    expect(promiseResult2.plainFiles.length).toBe(2);
    expect(promiseResult2.plainFiles[1]).toStrictEqual(files2[0]);
  });

  it('should also resolve the promise with empty arrays if the user cancels the selection', async () => {
    const { input, result } = invokeUseImperativeFilePicker({ doNotInvokeAutomatically: true });
    const promise = result.current.openFilePicker();

    expect(promise).toBeInstanceOf(Promise);

    await waitFor(() => result.current.loading === true);

    input.current?.dispatchEvent(new MouseEvent('cancel'));

    await waitFor(() => result.current.loading === false);

    promise.then(result => {
      expect(result.plainFiles.length).toBe(0);
      expect(result.filesContent.length).toBe(0);
      expect(result.errors.length).toBe(0);
    });
  });

  it('should resolve the promise with the cancellation error if the user cancels the selection and detectCancellation is set to promiseResultOnly', async () => {
    const { input, result } = invokeUseImperativeFilePicker({ doNotInvokeAutomatically: true });
    const promise = result.current.openFilePicker({ detectCancellation: 'promiseResultOnly' });

    expect(promise).toBeInstanceOf(Promise);

    await waitFor(() => result.current.loading === true);

    input.current?.dispatchEvent(new MouseEvent('cancel'));

    await waitFor(() => result.current.loading === false);

    promise.then(result => {
      expect(result.plainFiles.length).toBe(0);
      expect(result.filesContent.length).toBe(0);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0]?.name).toBe('SelectionCancelledError');
      if (result.errors[0]?.name === 'SelectionCancelledError') {
        expect(result.errors[0].reason).toBe('SELECTION_CANCELLED');
      } else {
        throw new Error('Expected SelectionCancelledError');
      }
    });

    await promise;

    // hook state doesn't show the error as user requested only the promise result to contain the error
    expect(result.current.errors.length).toBe(0);
  });

  it('should resolve the promise with the cancellation error and return the error from the hook state if the user cancels the selection and detectCancellation is set to promiseResultAndHookState', async () => {
    const { input, result } = invokeUseImperativeFilePicker({ doNotInvokeAutomatically: true });
    const promise = result.current.openFilePicker({ detectCancellation: 'promiseResultAndHookState' });

    expect(promise).toBeInstanceOf(Promise);

    await waitFor(() => result.current.loading === true);

    input.current?.dispatchEvent(new MouseEvent('cancel'));

    await waitFor(() => result.current.loading === false);

    promise.then(promiseResult => {
      expect(promiseResult.plainFiles.length).toBe(0);
      expect(promiseResult.filesContent.length).toBe(0);
      expect(promiseResult.errors.length).toBe(1);
      expect(promiseResult.errors[0]?.name).toBe('SelectionCancelledError');
      if (promiseResult.errors[0]?.name === 'SelectionCancelledError') {
        expect(promiseResult.errors[0].reason).toBe('SELECTION_CANCELLED');
      } else {
        throw new Error('Expected SelectionCancelledError');
      }
    });

    await waitFor(() => result.current.errors.length === 1);
    expect(result.current.errors[0]?.name).toBe('SelectionCancelledError');
    if (result.current.errors[0]?.name === 'SelectionCancelledError') {
      expect(result.current.errors[0].reason).toBe('SELECTION_CANCELLED');
    } else {
      throw new Error('Expected SelectionCancelledError');
    }
  });

  it('should respect overrides passed to openFilePicker', async () => {
    const { input, result } = invokeUseImperativeFilePicker({
      readFilesContent: false,
      doNotInvokeAutomatically: true,
    });

    const promise = result.current.openFilePicker({
      readFilesContent: true,
    });

    const files = [new File(['hello'], 'hello.png', { type: 'image/png' })];
    await userEvent.upload(input.current!, files);

    await waitFor(() => result.current.loading === false);

    const resultFromPromise = await promise;
    expect(resultFromPromise?.plainFiles.length).toBe(1);
    // this would be 0 but the override specified that we want to read the files content
    expect(resultFromPromise?.filesContent.length).toBe(1);

    await waitFor(() => result.current.plainFiles.length === 1);

    expect(result.current.plainFiles.length).toBe(1);
    expect(result.current.filesContent.length).toBe(1);
    expect(input.current!.files).toHaveLength(1);
    expect(input.current!.files?.[0]).toStrictEqual(files[0]);
  });

  it('the promise result should contain errors when validation fails', async () => {
    const validators = [new FileTypeValidator(['.nonexistent'])];
    const { input, result } = invokeUseImperativeFilePicker({ validators, doNotInvokeAutomatically: true });

    const promise = result.current.openFilePicker();

    const file = createFileOfSize(1024);
    await userEvent.upload(input.current!, file);

    await waitFor(() => result.current.loading === false);

    const promiseResult = await promise;
    expect(promiseResult.errors.length).toBe(1);
    if (promiseResult.errors[0]?.name === 'FileTypeError') {
      expect(promiseResult.errors[0]?.reason === 'FILE_TYPE_NOT_ACCEPTED').toBe(true);
    } else {
      throw new Error('Expected FileTypeError');
    }

    expect(result.current.plainFiles.length).toBe(0);
    if (result.current.errors[0]?.name === 'FileTypeError') {
      expect(result.current.errors[0]?.reason === 'FILE_TYPE_NOT_ACCEPTED').toBe(true);
    } else {
      throw new Error('Expected FileTypeError');
    }
  });
});
