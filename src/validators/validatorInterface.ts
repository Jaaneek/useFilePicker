import { FileWithPath } from 'file-selector';
import { UseFilePickerConfig } from '../interfaces';

export interface Validator {
  validateBeforeParsing(config: UseFilePickerConfig, plainFiles: File[]): Promise<void>;
  validateAfterParsing(config: UseFilePickerConfig, file: FileWithPath, reader: FileReader): Promise<void>;
}
