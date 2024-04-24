import { useCallback } from 'react';
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
  const onFilesSelected = useCallback(
    (data: SelectedFilesOrErrors<ExtractContentTypeFromConfig<ConfigType>, CustomErrors>) => {
      onFilesSelectedProp?.(data as any);
      validators?.forEach(validator => {
        validator.onFilesSelected(data as any);
      });
    },
    [onFilesSelectedProp, validators]
  );
  const onFilesSuccessfullySelected = useCallback(
    (data: SelectedFiles<ExtractContentTypeFromConfig<ConfigType>>) => {
      onFilesSuccessfullySelectedProp?.(data as any);
      validators?.forEach(validator => {
        validator.onFilesSuccessfullySelected(data);
      });
    },
    [validators, onFilesSuccessfullySelectedProp]
  );
  const onFilesRejected = useCallback(
    (errors: FileErrors<CustomErrors>) => {
      onFilesRejectedProp?.(errors);
      validators?.forEach(validator => {
        validator.onFilesRejected(errors);
      });
    },
    [validators, onFilesRejectedProp]
  );
  const onClear = useCallback(() => {
    onClearProp?.();
    validators?.forEach(validator => {
      validator.onClear?.();
    });
  }, [validators, onClearProp]);

  return {
    onFilesSelected,
    onFilesSuccessfullySelected,
    onFilesRejected,
    onClear,
  };
};
