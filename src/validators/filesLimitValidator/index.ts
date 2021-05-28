import { UseFilePickerConfig } from '../../interfaces';
import { Validator } from '../validatorInterface';

export default class FilesLimitValidator implements Validator {
  validateBeforeParsing(config: UseFilePickerConfig, plainFiles: File[]): Promise<void> {
    const { limitFilesConfig } = config;
    if (limitFilesConfig) {
      if (limitFilesConfig.max && plainFiles.length > limitFilesConfig.max) {
        return Promise.reject({ maxLimitExceeded: true });
      }

      if (limitFilesConfig.min && plainFiles.length < limitFilesConfig.min) {
        return Promise.reject({ minLimitNotReached: true });
      }
    }
    return Promise.resolve();
  }
  validateAfterParsing(): Promise<void> {
    return Promise.resolve();
  }
}
