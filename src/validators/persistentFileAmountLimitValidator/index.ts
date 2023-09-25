import { FileAmountLimitConfig, FileAmountLimitError, UseFilePickerConfig } from '../../interfaces';
import { Validator } from '../validatorBase';

class PersistentFileAmountLimitValidator extends Validator {
  private previousPlainFiles: File[] = [];

  constructor(private limitFilesConfig: FileAmountLimitConfig) {
    super();
  }

  onClear(): void {
    this.previousPlainFiles = [];
  }

  onFileRemoved(_removedFile: File, removedIndex: number): void {
    this.previousPlainFiles.splice(removedIndex, 1);
  }

  validateBeforeParsing(_config: UseFilePickerConfig, plainFiles: File[]): Promise<void> {
    const fileAmount = this.previousPlainFiles.length + plainFiles.length;
    const { min, max } = this.limitFilesConfig;
    if (max && fileAmount > max) {
      return Promise.reject({
        name: 'FileAmountLimitError',
        reason: 'MAX_AMOUNT_OF_FILES_EXCEEDED',
      } as FileAmountLimitError);
    }

    if (min && fileAmount < min) {
      return Promise.reject({
        name: 'FileAmountLimitError',
        reason: 'MIN_AMOUNT_OF_FILES_NOT_REACHED',
      } as FileAmountLimitError);
    }

    this.previousPlainFiles = [...this.previousPlainFiles, ...plainFiles];

    return Promise.resolve();
  }

  validateAfterParsing(): Promise<void> {
    return Promise.resolve();
  }
}

export default PersistentFileAmountLimitValidator;
