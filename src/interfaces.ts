import { FileWithPath } from 'file-selector';
import { Validator } from './validators/validatorBase';
import { XOR } from 'ts-xor';

// ========== ERRORS ==========

export type UseFilePickerError = { fileName: string } & (
  | FileSizeError
  | FileReaderError
  | FileAmountLimitError
  | ImageDimensionError
);

export interface FileReaderError {
  name: 'FileReaderError';
  causedByFile: FileWithPath;
  readerError?: DOMException | null;
}

export interface FileAmountLimitError {
  name: 'FileAmountLimitError';
  reason: 'MIN_AMOUNT_OF_FILES_NOT_REACHED' | 'MAX_AMOUNT_OF_FILES_EXCEEDED';
}

export interface FileSizeError {
  name: 'FileSizeError';
  causedByFile: FileWithPath;
  reason: 'FILE_SIZE_TOO_LARGE' | 'FILE_SIZE_TOO_SMALL';
}

export interface ImageDimensionError {
  name: 'ImageDimensionError';
  causedByFile: FileWithPath;
  reasons: (
    | 'IMAGE_WIDTH_TOO_BIG'
    | 'IMAGE_WIDTH_TOO_SMALL'
    | 'IMAGE_HEIGHT_TOO_BIG'
    | 'IMAGE_HEIGHT_TOO_SMALL'
    | 'IMAGE_NOT_LOADED'
  )[];
}

export type FileErrors = {
  errors: UseFilePickerError[];
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

export interface FileAmountLimitConfig {
  min?: number;
  max?: number;
}

// ========== MAIN TYPES ==========

export type ReadType = 'Text' | 'BinaryString' | 'ArrayBuffer' | 'DataURL';

export type ReaderMethod = keyof FileReader;

export type SelectedFiles<ContentType> = {
  plainFiles: File[];
  filesContent: FileContent<ContentType>[];
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
  errors: UseFilePickerError[];
  loading: boolean;
  plainFiles: File[];
  clear: () => void;
};

export type ImperativeFilePickerReturnTypes<ContentType> = FilePickerReturnTypes<ContentType> & {
  removeFileByIndex: (index: number) => void;
  removeFileByReference: (file: File) => void;
};
