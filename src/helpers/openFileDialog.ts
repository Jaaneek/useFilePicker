export function openFileDialog(
  accept: string,
  multiple: boolean,
  callback: (arg: Event) => void,
  initializeWithCustomAttributes?: (arg: HTMLInputElement) => void
): void {
  // this function must be called from a user
  // activation event (ie an onclick event)

  // Create an input element
  var inputElement = document.createElement('input');
  // Hide element and append to body (required to run on iOS safari)
  inputElement.style.display = 'none';
  document.body.appendChild(inputElement);
  // Set its type to file
  inputElement.type = 'file';
  // Set accept to the file types you want the user to select.
  // Include both the file extension and the mime type
  // if accept is "*" then dont set the accept attribute
  if (accept !== '*') inputElement.accept = accept;
  // Accept multiple files
  inputElement.multiple = multiple;
  // set onchange event to call callback when user has selected file
  //inputElement.addEventListener('change', callback);
  inputElement.addEventListener('change', arg => {
    callback(arg);
    // remove element
    document.body.removeChild(inputElement);
  });

  if (initializeWithCustomAttributes) {
    initializeWithCustomAttributes(inputElement);
  }
  // dispatch a click event to open the file dialog
  inputElement.dispatchEvent(new MouseEvent('click'));
}
