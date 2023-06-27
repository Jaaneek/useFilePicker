import {
  SelectedFilesOrErrors,
  ExtractContentTypeFromConfig,
  UseFilePickerConfig,
  SelectedFiles,
  FileErrors,
} from '../interfaces';

export const useValidators = <ConfigType extends UseFilePickerConfig<CustomErrors>, CustomErrors>({
  onFilesSelected: onFilesSelectedProp,
  onFilesSuccessfulySelected: onFilesSuccessfulySelectedProp,
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
  const onFilesSuccessfulySelected = (data: SelectedFiles<ExtractContentTypeFromConfig<ConfigType>>) => {
    onFilesSuccessfulySelectedProp?.(data as any);
    validators?.forEach(validator => {
      validator.onFilesSuccessfulySelected(data);
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
    onFilesSuccessfulySelected,
    onFilesRejected,
    onClear,
  };
};
