import { FileWithPath } from 'file-selector';
import { Validator } from './validators/validatorBase';
import { XOR } from 'ts-xor';
export type ReadType = 'Text' | 'BinaryString' | 'ArrayBuffer' | 'DataURL';

export type ReaderMethod = keyof FileReader;

export type SelectedFiles<ContentType> = {
  plainFiles: File[];
  filesContent: FileContent<ContentType>[];
};

export type FileErrors = {
  errors: FileError[];
};

export type SelectedFilesOrErrors<ContentType> = XOR<SelectedFiles<ContentType>, FileErrors>;

type UseFilePickerConfigCommon = {
  multiple?: boolean;
  accept?: string | string[];
  validators?: Validator[];
  onFilesRejected?: (data: FileErrors) => void;
  onClear?: () => void;
  initializeWithCustomParameters?: (inputElement: HTMLInputElement) => void;
};

type ReadFileContentConfig =
  | ({
      readFilesContent?: true | undefined | never;
    } & (
      | {
          readAs?: 'ArrayBuffer';
          onFilesSelected?: (data: SelectedFilesOrErrors<ArrayBuffer>) => void;
          onFilesSuccessfulySelected?: (data: SelectedFiles<ArrayBuffer>) => void;
        }
      | {
          readAs?: Exclude<ReadType, 'ArrayBuffer'>;
          onFilesSelected?: (data: SelectedFilesOrErrors<string>) => void;
          onFilesSuccessfulySelected?: (data: SelectedFiles<string>) => void;
        }
    ))
  | {
      readFilesContent: false;
      readAs?: never;
      onFilesSelected?: (data: SelectedFilesOrErrors<undefined>) => void;
      onFilesSuccessfulySelected?: (data: SelectedFiles<undefined>) => void;
    };

export type ExtractContentTypeFromConfig<Config> = Config extends { readAs: 'ArrayBuffer' } ? ArrayBuffer : string;

export type UseFilePickerConfig = UseFilePickerConfigCommon & ReadFileContentConfig;

export interface FileContent<ContentType> extends Blob {
  lastModified: number;
  name: string;
  content: ContentType;
}

export type FilePickerReturnTypes<ContentType> = {
  openFilePicker: () => void;
  filesContent: FileContent<ContentType>[];
  errors: FileError[];
  loading: boolean;
  plainFiles: File[];
  clear: () => void;
};

export type ImperativeFilePickerReturnTypes<ContentType> = FilePickerReturnTypes<ContentType> & {
  removeFileByIndex: (index: number) => void;
  removeFileByReference: (file: File) => void;
};

// ========== VALIDATOR CONFIGS ==========

export interface ImageDimensionRestrictionsConfig {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
}

export interface FileSizeRestrictions {
  /**Minimum file size in mb**/
  minFileSize?: number;
  /**Maximum file size in mb**/
  maxFileSize?: number;
}

export interface LimitAmountOfFilesConfig {
  min?: number;
  max?: number;
}

// ========== ERRORS ==========

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
