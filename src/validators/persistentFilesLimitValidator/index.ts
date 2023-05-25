import { UseFilePickerConfig } from '../../interfaces';
import { Validator } from '../validatorInterface';

/**
 * File limit validator has to be overriden to take into account the files that were previously selected
 * @param previousPlainFiles files that were previously selected
 * @returns a validator that checks if the amount of files selected previously and in the current batch is within the limits
 */
const persistentFileLimitValidator: (previousPlainFiles: File[]) => Validator = previousPlainFiles => ({
  validateBeforeParsing(config: UseFilePickerConfig, plainFiles: File[]): Promise<void> {
    const { limitFilesConfig } = config;
    const fileAmount = previousPlainFiles.length + plainFiles.length;
    if (limitFilesConfig) {
      if (limitFilesConfig.max && fileAmount > limitFilesConfig.max) {
        return Promise.reject({ maxLimitExceeded: true });
      }

      if (limitFilesConfig.min && fileAmount < limitFilesConfig.min) {
        return Promise.reject({ minLimitNotReached: true });
      }
    }
    return Promise.resolve();
  },
  validateAfterParsing(): Promise<void> {
    return Promise.resolve();
  },
});

export default persistentFileLimitValidator;
