export function openFileDialog(accept: string, multiple: boolean, pickDirectories: boolean, callback: (arg: Event) => void) {
  // This function must be called from a user
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
  inputElement.accept = accept;
  // Accept multiple files
  inputElement.multiple = multiple;

  // Allow user to pick directories - NON-STANDARD FEATURE!
  if (pickDirectories) {
    (inputElement as any).webkitdirectory = true;
  }

  // set onchange event to call callback when user has selected file
  inputElement.addEventListener('change', arg => {
    callback(arg);
    // remove element
    document.body.removeChild(inputElement);
  });

  // dispatch a click event to open the file dialog
  inputElement.dispatchEvent(new MouseEvent('click'));
}
