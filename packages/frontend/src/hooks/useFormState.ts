import { useState, useCallback, ChangeEvent, useRef } from 'react';

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

function shallowEqual<T extends FormValues>(obj1: T, obj2: T): boolean {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) {
    return false;
  }
  
  return keys1.every(key => obj1[key] === obj2[key]);
}

export function useFormState<T extends FormValues>(initialValues: T): UseFormStateReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const initialStateRef = useRef<T>(initialValues);
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = useCallback((field: keyof T, value: FormValue) => {
    setValues(prev => {
      const newValues = { ...prev, [field]: value };
      setIsDirty(!shallowEqual(newValues, initialStateRef.current));
      return newValues;
    });
  }, []);

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
    setValues(initialStateRef.current);
    setIsDirty(false);
  }, []);

  const setForm = useCallback((newValues: Partial<T>) => {
    setValues(prev => {
      const updatedValues = { ...prev, ...newValues };
      setIsDirty(!shallowEqual(updatedValues, initialStateRef.current));
      return updatedValues;
    });
  }, []);

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
