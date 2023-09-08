import { FileWithPath } from 'file-selector';
import { FileSizeError, FileSizeRestrictions, UseFilePickerConfig } from '../../interfaces';
import { Validator } from '../validatorBase';

export default class FileSizeValidator extends Validator {
  constructor(private fileSizeRestrictions: FileSizeRestrictions) {
    super();
  }

  async validateBeforeParsing(_config: UseFilePickerConfig, plainFiles: File[]): Promise<void> {
    const { minFileSize, maxFileSize } = this.fileSizeRestrictions;

    if (!minFileSize && !maxFileSize) {
      return Promise.resolve();
    }

    const errors = plainFiles
      .map(file => getFileSizeError({ minFileSize, maxFileSize, file }))
      .filter(error => !!error) as FileSizeError[];

    return errors.length > 0 ? Promise.reject(errors) : Promise.resolve();
  }
  async validateAfterParsing(_config: UseFilePickerConfig, _file: FileWithPath): Promise<void> {
    return Promise.resolve();
  }
}

const getFileSizeError = ({
  file,
  maxFileSize,
  minFileSize,
}: {
  minFileSize: number | undefined;
  maxFileSize: number | undefined;
  file: FileWithPath;
}): FileSizeError | undefined => {
  if (minFileSize) {
    const minBytes = minFileSize;
    if (file.size < minBytes) {
      return { name: 'FileSizeError', reason: 'FILE_SIZE_TOO_SMALL', causedByFile: file };
    }
  }
  if (maxFileSize) {
    const maxBytes = maxFileSize;
    if (file.size > maxBytes) {
      return { name: 'FileSizeError', reason: 'FILE_SIZE_TOO_LARGE', causedByFile: file };
    }
  }
};
