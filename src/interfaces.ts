export interface UseFilePickerConfig extends Options {
  multiple?: boolean;
  accept?: string | string[];
}

export interface FileContent {
  lastModified: number;
  name: string;
  content: string;
}

export type FilePickerReturnTypes = [FileContent[], FileError[], () => void, boolean];

export interface ImageDims {
  minImageWidth?: number;
  maxImageWidth?: number;
  minImageHeight?: number;
  maxImageHeight?: number;
}

export interface Options extends ImageDims {
  /**Minimum file size in mb**/
  minFileSize?: number;
  /**Maximum file size in mb**/
  maxFileSize?: number;
}

export interface FileError extends FileSizeError, FileReaderError {
  name?: string;
}

interface FileReaderError {
  readerError?: DOMException | null;
}

interface FileSizeError {
  fileSizeToolarge?: boolean;
  fileSizeTooSmall?: boolean;
}
