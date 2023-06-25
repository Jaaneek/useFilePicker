import { useCallback, useState } from 'react';
import {
  ExtractContentTypeFromConfig,
  FileContent,
  ImperativeFilePickerReturnTypes,
  SelectedFiles,
  SelectedFilesOrErrors,
  UseFilePickerConfig,
} from './interfaces';
import useFilePicker from './useFilePicker';

/**
 * A version of useFilePicker hook that keeps selected files between selections. On top of that it allows to remove files from the selection.
 */
function useImperativeFilePicker<ConfigType extends UseFilePickerConfig>(
  props: ConfigType
): ImperativeFilePickerReturnTypes<ExtractContentTypeFromConfig<ConfigType>> {
  const { readFilesContent, onFilesSelected, onFilesSuccessfulySelected } = props;

  const [allPlainFiles, setAllPlainFiles] = useState<File[]>([]);
  const [allFilesContent, setAllFilesContent] = useState<FileContent<ExtractContentTypeFromConfig<ConfigType>>[]>([]);

  const { openFilePicker, loading, errors, clear } = useFilePicker({
    ...props,
    onFilesSelected: (data: SelectedFilesOrErrors<any>) => {
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
    onFilesSuccessfulySelected: (data: SelectedFiles<any>) => {
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

  const clearAll = useCallback(() => {
    clear();
    // clear previous files
    setAllPlainFiles([]);
    if (readFilesContent) {
      setAllFilesContent([]);
    }
  }, [clear, readFilesContent]);

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

  return {
    openFilePicker,
    plainFiles: allPlainFiles,
    filesContent: allFilesContent,
    loading,
    errors,
    clear: clearAll,
    removeFileByIndex,
    removeFileByReference,
  };
}

export default useImperativeFilePicker;
