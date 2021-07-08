import { MutableRefObject } from 'react';

export function openFileDialog(
  accept: string,
  multiple: boolean,
  inputElementRef: MutableRefObject<HTMLInputElement | null> | undefined,
  callback: (arg: Event) => void
) {
  // this function must be called from a user
  // activation event (ie an onclick event)

  // Use provided input element or create a input element
  const inputElement = inputElementRef?.current || document.createElement('input');
  // Set its type to file
  inputElement.type = 'file';
  // Set accept to the file types you want the user to select.
  // Include both the file extension and the mime type
  inputElement.accept = accept;
  // Accept multiple files
  inputElement.multiple = multiple;
  // set onchange event to call callback when user has selected file
  inputElement.addEventListener('change', callback);
  // dispatch a click event to open the file dialog
  inputElement.dispatchEvent(new MouseEvent('click'));
}
