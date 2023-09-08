import { FileWithPath } from 'file-selector';
import { ImageDimensionError, ImageDimensionRestrictionsConfig, UseFilePickerConfig } from '../../interfaces';
import { Validator } from '../validatorBase';

export default class ImageDimensionsValidator extends Validator {
  constructor(private imageSizeRestrictions: ImageDimensionRestrictionsConfig) {
    super();
  }

  validateBeforeParsing(): Promise<void> {
    return Promise.resolve();
  }
  validateAfterParsing(config: UseFilePickerConfig, file: FileWithPath, reader: FileReader): Promise<void> {
    const { readAs } = config;
    if (readAs === 'DataURL' && this.imageSizeRestrictions && isImage(file.type)) {
      return checkImageDimensions(file, reader.result as string, this.imageSizeRestrictions);
    }
    return Promise.resolve();
  }
}

const isImage = (fileType: string) => fileType.startsWith('image');

const checkImageDimensions = (
  file: FileWithPath,
  imgDataURL: string,
  imageSizeRestrictions: ImageDimensionRestrictionsConfig
) =>
  new Promise<void>((resolve, reject) => {
    const img = new Image();
    let error: ImageDimensionError = {
      name: 'ImageDimensionError',
      causedByFile: file,
      reasons: [],
    };
    img.onload = function () {
      const { maxHeight, maxWidth, minHeight, minWidth } = imageSizeRestrictions;
      const { width, height } = this as unknown as typeof img;

      if (maxHeight && maxHeight < height) error.reasons.push('IMAGE_HEIGHT_TOO_BIG');
      if (minHeight && minHeight > height) error.reasons.push('IMAGE_HEIGHT_TOO_SMALL');
      if (maxWidth && maxWidth < width) error.reasons.push('IMAGE_WIDTH_TOO_BIG');
      if (minWidth && minWidth > width) error.reasons.push('IMAGE_WIDTH_TOO_SMALL');
      error.reasons.length ? reject(error) : resolve();
    };
    img.onerror = function () {
      error.reasons.push('IMAGE_NOT_LOADED');
      reject(error);
    };
    img.src = imgDataURL;
  });
