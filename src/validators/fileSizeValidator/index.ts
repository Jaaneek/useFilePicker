import { FileWithPath } from 'file-selector';
import { BYTES_PER_MEGABYTE } from '../../constants/bytesPerMegabyte';
import { UseFilePickerConfig } from '../../interfaces';
import { Validator } from '../validatorInterface';

export default class FileSizeValidator implements Validator {
  async validateBeforeParsing(config: UseFilePickerConfig, plainFiles: File[]): Promise<void> {
    const { minFileSize, maxFileSize } = config;

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
    const minBytes = minFileSize * BYTES_PER_MEGABYTE;
    if (fileSize < minBytes) {
      return { fileSizeTooSmall: true };
    }
  }
  if (maxFileSize) {
    const maxBytes = maxFileSize * BYTES_PER_MEGABYTE;
    if (fileSize > maxBytes) {
      return { fileSizeToolarge: true };
    }
  }
};
