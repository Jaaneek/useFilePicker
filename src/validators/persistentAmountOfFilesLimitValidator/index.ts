import { LimitAmountOfFilesConfig, UseFilePickerConfig } from '../../interfaces';
import { Validator } from '../validatorBase';

class PersistentAmountOfFilesLimitValidator extends Validator {
  private previousPlainFiles: File[] = [];

  constructor(private limitFilesConfig: LimitAmountOfFilesConfig) {
    super();
  }

  onClear(): void {
    this.previousPlainFiles = [];
  }

  onFileRemoved(removedIndex: number): void {
    this.previousPlainFiles.splice(removedIndex, 1);
  }

  validateBeforeParsing(_config: UseFilePickerConfig, plainFiles: File[]): Promise<void> {
    const fileAmount = this.previousPlainFiles.length + plainFiles.length;
    const { min, max } = this.limitFilesConfig;
    if (max && fileAmount > max) {
      return Promise.reject({ maxLimitExceeded: true });
    }

    if (min && fileAmount < min) {
      return Promise.reject({ minLimitNotReached: true });
    }

    this.previousPlainFiles = [...this.previousPlainFiles, ...plainFiles];

    return Promise.resolve();
  }

  validateAfterParsing(): Promise<void> {
    return Promise.resolve();
  }
}

export default PersistentAmountOfFilesLimitValidator;
