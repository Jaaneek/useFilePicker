import { useCallback, useState } from 'react';
import {
  ExtractContentTypeFromConfig,
  FileContent,
  ImperativeFilePickerReturnTypes,
  SelectedFiles,
  SelectedFilesOrErrors,
  useImperativeFilePickerConfig,
} from './interfaces';
import useFilePicker from './useFilePicker';

/**
 * A version of useFilePicker hook that keeps selected files between selections. On top of that it allows to remove files from the selection.
 */
function useImperativeFilePicker<
  CustomErrors = unknown,
  ConfigType extends useImperativeFilePickerConfig<CustomErrors> = useImperativeFilePickerConfig<CustomErrors>
>(props: ConfigType): ImperativeFilePickerReturnTypes<ExtractContentTypeFromConfig<ConfigType>, CustomErrors> {
  const { onFilesSelected, onFilesSuccessfullySelected, validators, onFileRemoved } = props;

  const [allPlainFiles, setAllPlainFiles] = useState<File[]>([]);
  const [allFilesContent, setAllFilesContent] = useState<FileContent<ExtractContentTypeFromConfig<ConfigType>>[]>([]);

  const { openFilePicker, loading, errors, clear } = useFilePicker<CustomErrors, ConfigType>({
    ...props,
    onFilesSelected: (data: SelectedFilesOrErrors<ExtractContentTypeFromConfig<ConfigType>, CustomErrors>) => {
      if (!onFilesSelected) return;
      if (data.errors?.length) {
        return onFilesSelected(data);
      }
      // override the files property to return all files that were selected previously and in the current batch
      onFilesSelected({
        errors: undefined,
        plainFiles: [...allPlainFiles, ...(data.plainFiles || [])],
        filesContent: [...allFilesContent, ...(data.filesContent || [])] as any,
      });
    },
    onFilesSuccessfullySelected: (data: SelectedFiles<any>) => {
      setAllPlainFiles(previousPlainFiles => previousPlainFiles.concat(data.plainFiles));
      setAllFilesContent(previousFilesContent => previousFilesContent.concat(data.filesContent));

      if (!onFilesSuccessfullySelected) return;
      // override the files property to return all files that were selected previously and in the current batch
      onFilesSuccessfullySelected({
        plainFiles: [...allPlainFiles, ...(data.plainFiles || [])],
        filesContent: [...allFilesContent, ...(data.filesContent || [])],
      });
    },
  });

  const clearAll = useCallback(() => {
    clear();
    // clear previous files
    setAllPlainFiles([]);
    setAllFilesContent([]);
  }, [clear]);

  const removeFileByIndex = useCallback(
    (index: number) => {
      setAllFilesContent(previousFilesContent => [
        ...previousFilesContent.slice(0, index),
        ...previousFilesContent.slice(index + 1),
      ]);
      setAllPlainFiles(previousPlainFiles => {
        const removedFile = previousPlainFiles[index];
        validators?.forEach(validator => validator.onFileRemoved?.(removedFile, index));
        onFileRemoved?.(removedFile, index);
        return [...previousPlainFiles.slice(0, index), ...previousPlainFiles.slice(index + 1)];
      });
    },
    [validators, onFileRemoved]
  );

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
