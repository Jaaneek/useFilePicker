import { FileWithPath } from 'file-selector';
import { FileErrors, SelectedFiles, SelectedFilesOrErrors, UseFilePickerConfig } from '../interfaces';

export abstract class Validator {
  protected invokerHookId: string | undefined;

  /**
   * This method is called before parsing the selected files. It is called once per selection.
   * @param config passed to the useFilePicker hook
   * @param plainFiles files selected by the user
   */
  abstract validateBeforeParsing(config: UseFilePickerConfig, plainFiles: File[]): Promise<void>;
  /**
   * This method is called after parsing the selected files. It is called once per every parsed file.
   * @param config passed to the useFilePicker hook
   * @param file parsed file selected by the user
   * @param reader instance that was used to parse the file
   */
  abstract validateAfterParsing(config: UseFilePickerConfig, file: FileWithPath, reader: FileReader): Promise<void>;

  /**
   * lifecycle method called after user selection (regardless of validation result)
   */
  onFilesSelected(_data: SelectedFilesOrErrors<any>): Promise<void> | void {}
  /**
   * lifecycle method called after successful validation
   */
  onFilesSuccessfulySelected(_data: SelectedFiles<any>): Promise<void> | void {}
  /**
   * lifecycle method called after failed validation
   */
  onFilesRejected(_data: FileErrors): Promise<void> | void {}
  /**
   * lifecycle method called after the selection is cleared
   */
  onClear(): Promise<void> | void {}

  /**
   * This method is called when file is removed from the list of selected files.
   * Invoked only by the useImperativeFilePicker hook
   * @param _removedIndex index of removed file
   */
  onFileRemoved(_removedIndex: number): Promise<void> | void {}
}
