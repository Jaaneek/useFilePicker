import { FileWithPath } from 'file-selector';
import { BYTES_PER_MEGABYTE } from '../../constants/bytesPerMegabyte';
import { UseFilePickerConfig } from '../../interfaces';
import { Validator } from '../validatorInterface';

export default class FileSizeValidator implements Validator {
  validateBeforeParsing(config: UseFilePickerConfig, plainFiles: File[]): Promise<void> {
    const { minFileSize, maxFileSize } = config;
    for (const file of plainFiles) {
      if (minFileSize || maxFileSize) {
        return checkFileSize({ minFileSize, maxFileSize, fileSize: file.size });
      }
    }
    return Promise.resolve();
  }
  async validateAfterParsing(_config: UseFilePickerConfig, _file: FileWithPath): Promise<void> {
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
