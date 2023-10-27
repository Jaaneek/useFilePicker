import { FileWithPath as FileWithPathFromSelector } from 'file-selector';
import { Validator } from './validators/validatorBase';
import { XOR } from 'ts-xor';

export type FileWithPath = FileWithPathFromSelector;

// ========== ERRORS ==========

type BaseErrors = FileSizeError | FileReaderError | FileAmountLimitError | ImageDimensionError | FileTypeError;

export type UseFilePickerError<CustomErrors = unknown> = CustomErrors extends {}
  ? BaseErrors | CustomErrors
  : BaseErrors;

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

export interface FileTypeError {
  name: 'FileTypeError';
  causedByFile: FileWithPath;
  reason: 'FILE_TYPE_NOT_ACCEPTED';
}

export type FileErrors<CustomErrors = unknown> = {
  errors: UseFilePickerError<CustomErrors>[];
};

// ========== VALIDATOR CONFIGS ==========

export interface ImageDimensionRestrictionsConfig {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
}

export interface FileSizeRestrictions {
  /**Minimum file size in bytes*/
  minFileSize?: number;
  /**Maximum file size in bytes*/
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

export type SelectedFilesOrErrors<ContentType, CustomErrors = unknown> = XOR<
  SelectedFiles<ContentType>,
  FileErrors<CustomErrors>
>;

type UseFilePickerConfigCommon = {
  multiple?: boolean;
  accept?: string | string[];
  validators?: Validator[];
  onFilesRejected?: (data: FileErrors) => void;
  onClear?: () => void;
  initializeWithCustomParameters?: (inputElement: HTMLInputElement) => void;
};

type ReadFileContentConfig<CustomErrors> =
  | ({
      readFilesContent?: true | undefined | never;
    } & (
      | {
          readAs?: 'ArrayBuffer';
          onFilesSelected?: (data: SelectedFilesOrErrors<ArrayBuffer, CustomErrors>) => void;
          onFilesSuccessfullySelected?: (data: SelectedFiles<ArrayBuffer>) => void;
        }
      | {
          readAs?: Exclude<ReadType, 'ArrayBuffer'>;
          onFilesSelected?: (data: SelectedFilesOrErrors<string, CustomErrors>) => void;
          onFilesSuccessfullySelected?: (data: SelectedFiles<string>) => void;
        }
    ))
  | {
      readFilesContent: false;
      readAs?: never;
      onFilesSelected?: (data: SelectedFilesOrErrors<undefined, CustomErrors>) => void;
      onFilesSuccessfullySelected?: (data: SelectedFiles<undefined>) => void;
    };

export type ExtractContentTypeFromConfig<Config> = Config extends { readAs: 'ArrayBuffer' } ? ArrayBuffer : string;

export type UseFilePickerConfig<CustomErrors = unknown> = UseFilePickerConfigCommon &
  ReadFileContentConfig<CustomErrors>;

export type useImperativeFilePickerConfig<CustomErrors = unknown> = UseFilePickerConfig<CustomErrors> & {
  onFileRemoved?: (file: FileWithPath, removedIndex: number) => void | Promise<void>;
};

export interface FileContent<ContentType> extends Blob {
  lastModified: number;
  name: string;
  content: ContentType;
}

export type FilePickerReturnTypes<ContentType, CustomErrors = unknown> = {
  openFilePicker: () => void;
  filesContent: FileContent<ContentType>[];
  errors: UseFilePickerError<CustomErrors>[];
  loading: boolean;
  plainFiles: File[];
  clear: () => void;
};

export type ImperativeFilePickerReturnTypes<ContentType, CustomErrors = unknown> = FilePickerReturnTypes<
  ContentType,
  CustomErrors
> & {
  removeFileByIndex: (index: number) => void;
  removeFileByReference: (file: File) => void;
};
