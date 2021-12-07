import { filePickerFactory } from './filePickerFactory';

/**
 * WARNING! This is a NON-STANDARD FEATURE! Some browsers might be not compatible with it!
 * Check https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/webkitdirectory for details.
 */
const useDirectoryPicker = filePickerFactory({ pickDirectories: true });

export default useDirectoryPicker;
