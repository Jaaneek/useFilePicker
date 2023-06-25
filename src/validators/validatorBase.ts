import { FileWithPath } from 'file-selector';
import { FileErrors, SelectedFiles, SelectedFilesOrErrors, UseFilePickerConfig } from '../interfaces';

export abstract class Validator {
  protected invokerHookId: string | undefined;

  initialize(_hookId: string) {
    this.invokerHookId = _hookId;
  }
  destroy(_hookId: string) {}

  abstract validateBeforeParsing(config: UseFilePickerConfig, plainFiles: File[]): Promise<void>;
  abstract validateAfterParsing(config: UseFilePickerConfig, file: FileWithPath, reader: FileReader): Promise<void>;

  onFilesSelected(_data: SelectedFilesOrErrors<any>): void {}
  onFilesSuccessfulySelected(_data: SelectedFiles<any>): void {}
  onFilesRejected(_data: FileErrors): void {}
  onClear(): void {}
}
