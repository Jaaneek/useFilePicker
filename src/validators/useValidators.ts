import { useEffect } from 'react';
import { Validator } from './validatorBase';
import { SelectedFilesOrErrors, ExtractContentTypeFromConfig } from '../interfaces';

export const useValidators = <ConfigType>({
  validators,
  uniqueHookId,
  onFilesSuccessfulySelected: onFilesSuccessfulySelectedProp,
  onFilesRejected: onFilesRejectedProp,
  onFilesSelected: onFilesSelectedProp,
  onClear: onClearProp,
}: {
  validators?: Validator[];
  uniqueHookId: string;
  onFilesSelected?: (data: SelectedFilesOrErrors<ExtractContentTypeFromConfig<ConfigType>>) => void;
  onFilesSuccessfulySelected?: (data: SelectedFilesOrErrors<ExtractContentTypeFromConfig<ConfigType>>) => void;
  onFilesRejected?: (data: SelectedFilesOrErrors<ExtractContentTypeFromConfig<ConfigType>>) => void;
  onClear?: () => void;
}) => {
  // setup validators' lifecycle methods
  useEffect(() => {
    validators?.forEach(validator => {
      validator.initialize(uniqueHookId);
    });
    return () => {
      validators?.forEach(validator => {
        validator.destroy(uniqueHookId);
      });
    };
  }, [validators]);

  const onFilesSelected = (data: SelectedFilesOrErrors<ExtractContentTypeFromConfig<ConfigType>>) => {
    onFilesSelectedProp?.(data as any);
    validators?.forEach(validator => {
      validator.onFilesSelected(data);
    });
  };
  const onFilesSuccessfulySelected = (data: SelectedFilesOrErrors<ExtractContentTypeFromConfig<ConfigType>>) => {
    onFilesSuccessfulySelectedProp?.(data as any);
    validators?.forEach(validator => {
      validator.onFilesSuccessfulySelected(data as any);
    });
  };
  const onFilesRejected = (data: SelectedFilesOrErrors<ExtractContentTypeFromConfig<ConfigType>>) => {
    onFilesRejectedProp?.(data as any);
    validators?.forEach(validator => {
      validator.onFilesRejected(data as any);
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
