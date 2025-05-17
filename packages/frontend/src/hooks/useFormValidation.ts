import { useState, useCallback } from 'react';

// Define the FormValue type to match useFormState
type FormValue = string | number | boolean | null;
type FormValues = Record<string, FormValue>;

export type ValidationRules<T> = {
  [K in keyof T]?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: unknown, formValues: T) => boolean;
    errorMessage?: string;
  };
};

type ValidationErrors<T> = {
  [K in keyof T]?: string;
};

export function useFormValidation<T extends FormValues>(
  initialValues: T,
  validationRules: ValidationRules<T>
) {
  const [errors, setErrors] = useState<ValidationErrors<T>>({});
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  const validateField = useCallback(
    (name: keyof T, value: FormValue, allValues: T): string | undefined => {
      const rules = validationRules[name];
      if (!rules) return undefined;

      if (rules.required && !value) {
        return rules.errorMessage || 'This field is required';
      }

      if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
        return rules.errorMessage || `Minimum length is ${rules.minLength}`;
      }

      if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
        return rules.errorMessage || `Maximum length is ${rules.maxLength}`;
      }

      if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
        return rules.errorMessage || 'Invalid format';
      }

      if (rules.custom && !rules.custom(value, allValues)) {
        return rules.errorMessage || 'Invalid value';
      }

      return undefined;
    },
    [validationRules]
  );

  const validateForm = useCallback(
    (values: T): ValidationErrors<T> => {
      const newErrors: ValidationErrors<T> = {};
      let hasErrors = false;

      for (const key in validationRules) {
        const fieldName = key as keyof T;
        const error = validateField(fieldName, values[fieldName], values);
        if (error) {
          newErrors[fieldName] = error;
          hasErrors = true;
        }
      }

      setErrors(newErrors);
      return hasErrors ? newErrors : {};
    },
    [validateField, validationRules]
  );

  const handleBlur = useCallback(
    (fieldName: keyof T) => {
      setTouched(prev => ({ ...prev, [fieldName]: true }));
    },
    []
  );

  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched({} as Record<keyof T, boolean>);
  }, []);

  const isValid = useCallback(
    (values: T): boolean => {
      const validationErrors = validateForm(values);
      return Object.keys(validationErrors).length === 0;
    },
    [validateForm]
  );

  return {
    errors,
    touched,
    validateField,
    validateForm,
    handleBlur,
    clearErrors,
    isValid,
  };
}
