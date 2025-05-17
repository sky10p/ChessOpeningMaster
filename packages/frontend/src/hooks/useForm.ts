import { useFormState } from './useFormState';
import { useFormValidation, ValidationRules } from './useFormValidation';
import { useCallback } from 'react';

type FormValue = string | number | boolean | null;
type FormValues = Record<string, FormValue>;

export function useForm<T extends FormValues>(
  initialValues: T,
  validationRules?: ValidationRules<T>
) {
  const {
    values,
    handleChange,
    handleInputChange,
    resetForm,
    setForm,
    isDirty,
    getValues
  } = useFormState(initialValues);

  const {
    errors,
    touched,
    validateForm,
    handleBlur,
    clearErrors,
    isValid
  } = useFormValidation(values, validationRules || {});

  const handleSubmit = useCallback(
    (onSubmit: (values: T) => void) => {
      return (e?: React.FormEvent) => {
        if (e) {
          e.preventDefault();
        }

        const validationErrors = validateForm(values);
        
        if (Object.keys(validationErrors).length === 0) {
          onSubmit(values);
        }
      };
    },
    [validateForm, values]
  );

  const reset = useCallback(() => {
    resetForm();
    clearErrors();
  }, [resetForm, clearErrors]);

  return {
    values,
    errors,
    touched,
    isDirty,
    handleChange,
    handleInputChange,
    handleBlur,
    setForm,
    reset,
    handleSubmit,
    isValid: () => isValid(values),
    getValues
  };
}
