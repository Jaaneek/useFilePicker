import { FileWithPath } from 'file-selector';
import { BYTES_PER_MEGABYTE } from '../../constants/bytesPerMegabyte';
import { UseFilePickerConfig } from '../../interfaces';
import { Validator } from '../validatorInterface';

export default class FileSizeValidator implements Validator {
  validateBeforeParsing(_config: UseFilePickerConfig, _plainFiles: File[]): Promise<void> {
    return Promise.resolve();
  }
  async validateAfterParsing(config: UseFilePickerConfig, file: FileWithPath): Promise<void> {
    const { minFileSize, maxFileSize } = config;
    if (minFileSize || maxFileSize) {
      return checkFileSize({ minFileSize, maxFileSize, fileSize: file.size });
    }
    return Promise.resolve();
  }
}

const checkFileSize = ({ fileSize, maxFileSize, minFileSize }: { minFileSize: number | undefined; maxFileSize: number | undefined; fileSize: number }) =>
  new Promise<void>((resolve, reject) => {
    if (minFileSize) {
      const minBytes = minFileSize * BYTES_PER_MEGABYTE;
      if (fileSize < minBytes) {
        reject({ fileSizeTooSmall: true });
      }
    }
    if (maxFileSize) {
      const maxBytes = maxFileSize * BYTES_PER_MEGABYTE;
      if (fileSize > maxBytes) {
        reject({ fileSizeToolarge: true });
      }
    }
    resolve();
  });
