import { useCallback } from 'react';

type FormValue = string | number | boolean | null;

export function useFormField<T extends Record<string, FormValue>>(
  values: T,
  errors: Partial<Record<keyof T, string>>,
  touched: Partial<Record<keyof T, boolean>>,
  handleChange: (field: keyof T, value: FormValue) => void,
  handleBlur: (field: keyof T) => void
) {
  const getFieldProps = useCallback(
    (fieldName: keyof T) => ({
      name: fieldName,
      value: values[fieldName],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => 
        handleChange(fieldName, e.target.value),
      onBlur: () => handleBlur(fieldName),
      error: errors[fieldName],
      touched: !!touched[fieldName]
    }),
    [values, errors, touched, handleChange, handleBlur]
  );

  return {
    getFieldProps
  };
}
