import { FileWithPath } from 'file-selector';
import { Validator } from './validators/validatorInterface';
import { XOR } from 'ts-xor';
export type ReadType = 'Text' | 'BinaryString' | 'ArrayBuffer' | 'DataURL';

export type ReaderMethod = keyof FileReader;

export interface LimitFilesConfig {
  min?: number;
  max?: number;
}

export type SelectedFiles = {
  plainFiles: File[];
  filesContent: FileContent[];
};

export type FileErrors = {
  errors: FileError[];
};

export type SelectedFilesOrErrors = XOR<SelectedFiles, FileErrors>;

export interface UseFilePickerConfig extends Options {
  multiple?: boolean;
  accept?: string | string[];
  readAs?: ReadType;
  limitFilesConfig?: LimitFilesConfig;
  readFilesContent?: boolean;
  imageSizeRestrictions?: ImageDims;
  validators?: Validator[];
  onFilesSelected?: (data: SelectedFilesOrErrors) => void;
  onFilesSuccessfulySelected?: (data: SelectedFiles) => void;
  onFilesRejected?: (data: FileErrors) => void;
  initializeWithCustomParameters?: (inputElement: HTMLInputElement) => void;
}

export interface FileContent extends Blob {
  lastModified: number;
  name: string;
  content: string;
}

export type FilePickerReturnTypes = [
  () => void,
  { filesContent: FileContent[]; errors: FileError[]; loading: boolean; plainFiles: File[]; clear: () => void }
];

export type ImperativeFilePickerReturnTypes = [
  FilePickerReturnTypes[0],
  FilePickerReturnTypes[1] & { removeFileByIndex: (index: number) => void; removeFileByReference: (file: File) => void }
];

export interface ImageDims {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
}

export interface Options {
  /**Minimum file size in mb**/
  minFileSize?: number;
  /**Maximum file size in mb**/
  maxFileSize?: number;
}

export interface FileError extends FileSizeError, FileReaderError, FileLimitError, ImageDimensionError {
  name?: string;
  plainFile: FileWithPath;
}

export interface FileReaderError {
  readerError?: DOMException | null;
}

export interface FileLimitError {
  minLimitNotReached?: boolean;
  maxLimitExceeded?: boolean;
}

export interface FileSizeError {
  fileSizeToolarge?: boolean;
  fileSizeTooSmall?: boolean;
}

export interface ImageDimensionError {
  imageWidthTooBig?: boolean;
  imageWidthTooSmall?: boolean;
  imageHeightTooBig?: boolean;
  imageHeightTooSmall?: boolean;
  imageNotLoaded?: boolean;
}
