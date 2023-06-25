import { LimitAmountOfFilesConfig, UseFilePickerConfig } from '../../interfaces';
import { Validator } from '../validatorBase';

/**
 * File limit validator has to be overriden to take into account the files that were previously selected
 */
class PersistentAmountOfFilesLimitValidator extends Validator {
  private static previousPlainFiles: Map<string, File[]> = new Map();

  constructor(private limitFilesConfig: LimitAmountOfFilesConfig) {
    super();
  }

  initialize(_hookId: string): void {
    super.initialize(_hookId);
    if (!PersistentAmountOfFilesLimitValidator.previousPlainFiles.has(_hookId)) {
      this.setPreviousPlainFilesToEmptyArray();
    }
  }

  onClear(): void {
    this.setPreviousPlainFilesToEmptyArray();
  }

  private setPreviousPlainFilesToEmptyArray() {
    PersistentAmountOfFilesLimitValidator.previousPlainFiles.set(this.invokerHookId!, []);
  }

  validateBeforeParsing(_config: UseFilePickerConfig, plainFiles: File[]): Promise<void> {
    const previousPlainFiles = PersistentAmountOfFilesLimitValidator.previousPlainFiles.get(this.invokerHookId!)!;
    const fileAmount = previousPlainFiles.length + plainFiles.length;
    const { min, max } = this.limitFilesConfig;
    if (max && fileAmount > max) {
      return Promise.reject({ maxLimitExceeded: true });
    }

    if (min && fileAmount < min) {
      return Promise.reject({ minLimitNotReached: true });
    }

    PersistentAmountOfFilesLimitValidator.previousPlainFiles.set(this.invokerHookId!, [
      ...previousPlainFiles,
      ...plainFiles,
    ]);

    return Promise.resolve();
  }
  validateAfterParsing(): Promise<void> {
    return Promise.resolve();
  }
}

export default PersistentAmountOfFilesLimitValidator;
