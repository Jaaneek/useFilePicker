import { FileAmountLimitError, FileAmountLimitConfig, UseFilePickerConfig } from '../../interfaces';
import { Validator } from '../validatorBase';

export default class FileAmountLimitValidator extends Validator {
  constructor(private limitAmountOfFilesConfig: FileAmountLimitConfig) {
    super();
  }

  validateBeforeParsing(_config: UseFilePickerConfig, plainFiles: File[]): Promise<void> {
    const { min, max } = this.limitAmountOfFilesConfig;
    if (max && plainFiles.length > max) {
      return Promise.reject({
        name: 'FileAmountLimitError',
        reason: 'MAX_AMOUNT_OF_FILES_EXCEEDED',
      } as FileAmountLimitError);
    }

    if (min && plainFiles.length < min) {
      return Promise.reject({
        name: 'FileAmountLimitError',
        reason: 'MIN_AMOUNT_OF_FILES_NOT_REACHED',
      } as FileAmountLimitError);
    }
    return Promise.resolve();
  }
  validateAfterParsing(): Promise<void> {
    return Promise.resolve();
  }
}
