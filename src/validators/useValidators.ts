import {
  SelectedFilesOrErrors,
  ExtractContentTypeFromConfig,
  UseFilePickerConfig,
  SelectedFiles,
  FileErrors,
} from '../interfaces';

export const useValidators = <ConfigType extends UseFilePickerConfig<CustomErrors>, CustomErrors>({
  onFilesSelected: onFilesSelectedProp,
  onFilesSuccessfullySelected: onFilesSuccessfullySelectedProp,
  onFilesRejected: onFilesRejectedProp,
  onClear: onClearProp,
  validators,
}: ConfigType) => {
  // setup validators' event handlers
  const onFilesSelected = (data: SelectedFilesOrErrors<ExtractContentTypeFromConfig<ConfigType>, CustomErrors>) => {
    onFilesSelectedProp?.(data as any);
    validators?.forEach(validator => {
      validator.onFilesSelected(data as any);
    });
  };
  const onFilesSuccessfullySelected = (data: SelectedFiles<ExtractContentTypeFromConfig<ConfigType>>) => {
    onFilesSuccessfullySelectedProp?.(data as any);
    validators?.forEach(validator => {
      validator.onFilesSuccessfullySelected(data);
    });
  };
  const onFilesRejected = (errors: FileErrors<CustomErrors>) => {
    onFilesRejectedProp?.(errors);
    validators?.forEach(validator => {
      validator.onFilesRejected(errors);
    });
  };
  const onClear = () => {
    onClearProp?.();
    validators?.forEach(validator => {
      validator.onClear?.();
    });
  };

  return {
    onFilesSelected,
    onFilesSuccessfullySelected,
    onFilesRejected,
    onClear,
  };
};
