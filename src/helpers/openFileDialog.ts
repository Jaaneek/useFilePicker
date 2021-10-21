export function openFileDialog(accept: string, multiple: boolean, webkitdirectory: boolean, callback: (arg: Event) => void) {
  // this function must be called from a user
  // activation event (ie an onclick event)

  // Create an input element
  var inputElement = document.createElement('input');
  // Set its type to file
  inputElement.type = 'file';
  // Set accept to the file types you want the user to select.
  // Include both the file extension and the mime type
  inputElement.accept = accept;
  // Accept multiple files
  inputElement.multiple = multiple;
  // Accept directory
  /* @ts-expect-error */
  inputElement.webkitdirectory = webkitdirectory;
  // set onchange event to call callback when user has selected file
  inputElement.addEventListener('change', callback);
  // set onblur event to call callback when user has selected file on Safari
  inputElement.addEventListener('blur', callback);
  // dispatch a click event to open the file dialog
  inputElement.dispatchEvent(new MouseEvent('click'));
}
