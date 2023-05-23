import { useCallback, useState } from 'react';
import { FileContent, ImperativeFilePickerReturnTypes, UseFilePickerConfig } from './interfaces';
import useFilePicker from './useFilePicker';
import persistentFileLimitValidator from './validators/persistentFilesLimitValidator';

/**
 * A version of useFilePicker hook that keeps selected files between selections. On top of that it allows to remove files from the selection.
 */
function useImperativeFilePicker(props: UseFilePickerConfig): ImperativeFilePickerReturnTypes {
  const { readFilesContent, onFilesSelected, onFilesSuccessfulySelected } = props;

  const [allPlainFiles, setAllPlainFiles] = useState<File[]>([]);
  const [allFilesContent, setAllFilesContent] = useState<FileContent[]>([]);

  const [open, { loading, errors, clear }] = useFilePicker({
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
      setAllPlainFiles(previousPlainFiles => previousPlainFiles.concat(data.plainFiles));
      setAllFilesContent(previousFilesContent => previousFilesContent.concat(data.filesContent));

      if (!onFilesSuccessfulySelected) return;
      // override the files property to return all files that were selected previously and in the current batch
      onFilesSuccessfulySelected({
        plainFiles: [...allPlainFiles, ...(data.plainFiles || [])],
        filesContent: [...allFilesContent, ...(data.filesContent || [])],
      });
    },
  });

  const clearPreviousFiles = useCallback(() => {
    setAllPlainFiles([]);
    if (readFilesContent) {
      setAllFilesContent([]);
    }
  }, [readFilesContent]);

  const clearAll = useCallback(() => {
    clear();
    clearPreviousFiles();
  }, [clear, clearPreviousFiles]);

  const removeFileByIndex = useCallback((index: number) => {
    setAllPlainFiles(previousPlainFiles => [
      ...previousPlainFiles.slice(0, index),
      ...previousPlainFiles.slice(index + 1),
    ]);
    setAllFilesContent(previousFilesContent => [
      ...previousFilesContent.slice(0, index),
      ...previousFilesContent.slice(index + 1),
    ]);
  }, []);

  const removeFileByReference = useCallback(
    (file: File) => {
      const index = allPlainFiles.findIndex(f => f === file);
      if (index === -1) return;
      removeFileByIndex(index);
    },
    [removeFileByIndex, allPlainFiles]
  );

  return [
    open,
    {
      plainFiles: allPlainFiles,
      filesContent: allFilesContent,
      loading,
      errors,
      clear: clearAll,
      removeFileByIndex,
      removeFileByReference,
    },
  ];
}

export default useImperativeFilePicker;
