import { useState, useCallback, ChangeEvent } from 'react';

type FormValue = string | number | boolean | null;
type FormValues = Record<string, FormValue>;

interface UseFormStateReturn<T extends FormValues> {
  values: T;
  setValues: React.Dispatch<React.SetStateAction<T>>;
  handleChange: (field: keyof T, value: FormValue) => void;
  handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  resetForm: () => void;
  setForm: (newValues: Partial<T>) => void;
  getFormData: () => T;
  isDirty: boolean;
  getValues: <K extends keyof T>() => { [P in K]: T[P] };
}

export function useFormState<T extends FormValues>(initialValues: T): UseFormStateReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [initialState] = useState<T>(initialValues);
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = useCallback((field: keyof T, value: FormValue) => {
    setValues(prev => {
      const newValues = { ...prev, [field]: value };
      setIsDirty(JSON.stringify(newValues) !== JSON.stringify(initialState));
      return newValues;
    });
  }, [initialState]);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let finalValue: FormValue = value;
    
    // Handle different input types
    if (type === 'checkbox' && 'checked' in e.target) {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      finalValue = value === '' ? '' : Number(value);
    }
    
    handleChange(name as keyof T, finalValue);
  }, [handleChange]);

  const resetForm = useCallback(() => {
    setValues(initialState);
    setIsDirty(false);
  }, [initialState]);

  const setForm = useCallback((newValues: Partial<T>) => {
    setValues(prev => {
      const updatedValues = { ...prev, ...newValues };
      setIsDirty(JSON.stringify(updatedValues) !== JSON.stringify(initialState));
      return updatedValues;
    });
  }, [initialState]);

  const getFormData = useCallback(() => values, [values]);
  
  // New method to get values without type casting
  const getValues = useCallback(() => {
    return values as { [P in keyof T]: T[P] };
  }, [values]);

  return {
    values,
    setValues,
    handleChange,
    handleInputChange,
    resetForm,
    setForm,
    getFormData,
    isDirty,
    getValues
  };
}
