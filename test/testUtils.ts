import { act, renderHook } from '@testing-library/react';
import useFilePicker from '../src/useFilePicker';
import { useImperativeFilePicker } from '../src';
import { ExtractContentTypeFromConfig, ImperativeFilePickerReturnTypes, UseFilePickerConfig } from '../src/types';

export const isInputElement = (el: HTMLElement): el is HTMLInputElement => el instanceof HTMLInputElement;

export function createFileOfSize(sizeInBytes: number) {
  const content = new ArrayBuffer(sizeInBytes);
  const file = new File([content], 'bigFile.txt', { type: 'text/plain' });
  return file;
}

type UseFilePickerHook = typeof useFilePicker | typeof useImperativeFilePicker;

const invokeFilePicker = (props: UseFilePickerConfig, useFilePicker: UseFilePickerHook) => {
  let input: { current: HTMLInputElement | null } = { current: null };

  const { result } = renderHook(() =>
    useFilePicker({
      ...props,
      initializeWithCustomParameters(inputElement) {
        input.current = inputElement;
      },
    })
  );

  act(() => {
    result.current.openFilePicker();
  });

  if (!isInputElement(input.current!)) throw new Error('Input not found');

  return {
    result,
    input,
  };
};

export const invokeUseFilePicker = (props: UseFilePickerConfig) => invokeFilePicker(props, useFilePicker);

export const invokeUseImperativeFilePicker = <T extends UseFilePickerConfig>(props: T) =>
  invokeFilePicker(props, useImperativeFilePicker) as {
    result: {
      current: ImperativeFilePickerReturnTypes<ExtractContentTypeFromConfig<T>>;
    };
    input: { current: HTMLInputElement };
  };
