import { useEffect, useState } from 'react';
import { FileContent, ImperativeFilePickerReturnTypes, UseFilePickerConfig } from './interfaces';
import useFilePicker from './useFilePicker';
import { Validator } from './validators/validatorInterface';

/**
 * File limit validator has to be overriden to take into account the files that were previously selected
 * @param previousPlainFiles files that were previously selected
 * @returns a validator that checks if the amount of files selected previously and in the current batch is within the limits
 */
const persistentFileLimitValidator: (previousPlainFiles: File[]) => Validator = previousPlainFiles => ({
  validateBeforeParsing(config: UseFilePickerConfig, plainFiles: File[]): Promise<void> {
    const { limitFilesConfig } = config;
    const fileAmount = previousPlainFiles.length + plainFiles.length;
    if (limitFilesConfig) {
      if (limitFilesConfig.max && fileAmount > limitFilesConfig.max) {
        return Promise.reject({ maxLimitExceeded: true });
      }

      if (limitFilesConfig.min && fileAmount < limitFilesConfig.min) {
        return Promise.reject({ minLimitNotReached: true });
      }
    }
    return Promise.resolve();
  },
  validateAfterParsing(): Promise<void> {
    return Promise.resolve();
  },
});

// Comparators needed to check if the file was already selected previously

const areFilesEqual = (file1: File | undefined, file2: File | undefined) =>
  !!file1 &&
  !!file2 &&
  file1.name === file2.name &&
  file1.lastModified === file2.lastModified &&
  file1.webkitRelativePath === file2.webkitRelativePath &&
  file1.size === file2.size &&
  file1.type === file2.type;

const areFilesContentEqual = (file1: FileContent | undefined, file2: FileContent | undefined) =>
  !!file1 &&
  !!file2 &&
  file1.name === file2.name &&
  file1.lastModified === file2.lastModified &&
  file1.size === file2.size &&
  file1.type === file2.type &&
  file1.content === file2.content;

/**
 * A version of useFilePicker hook that keeps selected files between selections. On top of that it allows to remove files from the selection.
 */
function useImperativeFilePicker(props: UseFilePickerConfig): ImperativeFilePickerReturnTypes {
  const { readFilesContent, onFilesSelected, onFilesSuccessfulySelected } = props;

  const [allPlainFiles, setAllPlainFiles] = useState<File[]>([]);
  const [allFilesContent, setAllFilesContent] = useState<FileContent[]>([]);

  const [open, { plainFiles, filesContent, loading, errors, clear }] = useFilePicker({
    ...props,
    validators: [persistentFileLimitValidator(allPlainFiles), ...(props.validators || [])],
    onFilesSelected: data => {
      if (!onFilesSelected) return;
      if (data.errors?.length) {
        return onFilesSelected(data);
      }
      // override the files property to return all files that were selected previously and in the current batch
      onFilesSelected({
        errors: undefined,
        plainFiles: [...allPlainFiles, ...(data.plainFiles || [])],
        filesContent: [...allFilesContent, ...(data.filesContent || [])],
      });
    },
    onFilesSuccessfulySelected: data => {
      if (!onFilesSuccessfulySelected) return;
      // override the files property to return all files that were selected previously and in the current batch
      onFilesSuccessfulySelected({
        plainFiles: [...allPlainFiles, ...(data.plainFiles || [])],
        filesContent: [...allFilesContent, ...(data.filesContent || [])],
      });
    },
  });

  const clearPreviousFiles = () => {
    setAllPlainFiles([]);
    if (readFilesContent) {
      setAllFilesContent([]);
    }
  };

  const clearAll = () => {
    clear();
    clearPreviousFiles();
  };

  const removeFileByIndex = (index: number) => {
    setAllPlainFiles([...allPlainFiles.slice(0, index), ...allPlainFiles.slice(index + 1)]);

    if (!readFilesContent) return;
    setAllFilesContent([...allFilesContent.slice(0, index), ...allFilesContent.slice(index + 1)]);
  };

  useEffect(() => {
    if (errors.length > 0) {
      clearPreviousFiles();
      return;
    }
    // If the last file in the previous batch is the same as the last file in the current batch, we don't need to update the state
    if (areFilesEqual(allPlainFiles.at(-1), plainFiles.at(-1))) return;

    setAllPlainFiles(previousPlainFiles => previousPlainFiles.concat(plainFiles));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plainFiles, errors]);

  useEffect(() => {
    if (errors.length > 0) {
      clearPreviousFiles();
      return;
    }
    if (!readFilesContent) return;
    // If the last file in the previous batch is the same as the last file in the current batch, we don't need to update the state
    if (areFilesContentEqual(allFilesContent.at(-1), filesContent.at(-1))) return;

    setAllFilesContent(previousFilesContent => previousFilesContent.concat(filesContent));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filesContent, readFilesContent]);

  return [
    open,
    { plainFiles: allPlainFiles, filesContent: allFilesContent, loading, errors, clear: clearAll, removeFileByIndex },
  ];
}

export default useImperativeFilePicker;
