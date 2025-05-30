/* eslint-disable @typescript-eslint/no-unused-vars */
import type { FileWithPath, UseFilePickerConfig } from '../../interfaces.js';
import { Validator } from '../validatorBase.js';

export default class FileTypeValidator extends Validator {
  constructor(private readonly acceptedFileExtensions: string[]) {
    super();
  }

  validateBeforeParsing(_config: UseFilePickerConfig, plainFiles: File[]): Promise<void> {
    const fileExtensionErrors = plainFiles.reduce<{ name: string; reason: string; causedByFile: File }[]>(
      (errors, currentFile) => {
        const fileExtension = currentFile.name.split('.').pop();
        if (!fileExtension) {
          return [
            ...errors,
            {
              name: 'FileTypeError',
              reason: 'FILE_EXTENSION_NOT_FOUND',
              causedByFile: currentFile,
            },
          ];
        }
        if (!this.acceptedFileExtensions.includes(fileExtension)) {
          return [
            ...errors,
            {
              name: 'FileTypeError',
              reason: 'FILE_TYPE_NOT_ACCEPTED',
              causedByFile: currentFile,
            },
          ];
        }

        return errors;
      },
      []
    );

    return fileExtensionErrors.length > 0 ? Promise.reject(fileExtensionErrors) : Promise.resolve();
  }

  validateAfterParsing(_config: UseFilePickerConfig, _file: FileWithPath, _reader: FileReader): Promise<void> {
    return Promise.resolve();
  }
}
