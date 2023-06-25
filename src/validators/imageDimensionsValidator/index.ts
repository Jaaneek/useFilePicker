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
      return checkImageDimensions(reader.result as string, this.imageSizeRestrictions);
    }
    return Promise.resolve();
  }
}

const isImage = (fileType: string) => fileType.startsWith('image');

const checkImageDimensions = (imgDataURL: string, imageSizeRestrictions: ImageDimensionRestrictionsConfig) =>
  new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.onload = function () {
      const { maxHeight, maxWidth, minHeight, minWidth } = imageSizeRestrictions;
      const { width, height } = this as unknown as typeof img;
      let errors: ImageDimensionError = {};
      if (maxHeight && maxHeight < height) errors = { ...errors, imageHeightTooBig: true };
      if (minHeight && minHeight > height) errors = { ...errors, imageHeightTooSmall: true };
      if (maxWidth && maxWidth < width) errors = { ...errors, imageWidthTooBig: true };
      if (minWidth && minWidth > width) errors = { ...errors, imageWidthTooSmall: true };
      Object.keys(errors).length ? reject(errors) : resolve();
    };
    img.onerror = function () {
      reject({ imageNotLoaded: true } as ImageDimensionError);
    };
    img.src = imgDataURL;
  });
