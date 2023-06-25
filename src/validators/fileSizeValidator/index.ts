import { FileWithPath } from 'file-selector';
import { FileSizeRestrictions, UseFilePickerConfig } from '../../interfaces';
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
      .map(file => getFileSizeError({ minFileSize, maxFileSize, fileSize: file.size }))
      .filter(error => !!error);

    return errors.length > 0 ? Promise.reject(errors[0]) : Promise.resolve();
  }
  async validateAfterParsing(_config: UseFilePickerConfig, _file: FileWithPath): Promise<void> {
    return Promise.resolve();
  }
}

const getFileSizeError = ({
  fileSize,
  maxFileSize,
  minFileSize,
}: {
  minFileSize: number | undefined;
  maxFileSize: number | undefined;
  fileSize: number;
}) => {
  if (minFileSize) {
    const minBytes = minFileSize;
    if (fileSize < minBytes) {
      return { fileSizeTooSmall: true };
    }
  }
  if (maxFileSize) {
    const maxBytes = maxFileSize;
    if (fileSize > maxBytes) {
      return { fileSizeToolarge: true };
    }
  }
};
