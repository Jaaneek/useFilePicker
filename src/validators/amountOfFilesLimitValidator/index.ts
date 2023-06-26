import { LimitAmountOfFilesConfig, UseFilePickerConfig } from '../../interfaces';
import { Validator } from '../validatorBase';

export default class AmountOfFilesLimitValidator extends Validator {
  constructor(private limitAmountOfFilesConfig: LimitAmountOfFilesConfig) {
    super();
  }

  validateBeforeParsing(_config: UseFilePickerConfig, plainFiles: File[]): Promise<void> {
    const { min, max } = this.limitAmountOfFilesConfig;
    if (max && plainFiles.length > max) {
      return Promise.reject({ maxLimitExceeded: true });
    }

    if (min && plainFiles.length < min) {
      return Promise.reject({ minLimitNotReached: true });
    }
    return Promise.resolve();
  }
  validateAfterParsing(): Promise<void> {
    return Promise.resolve();
  }
}
