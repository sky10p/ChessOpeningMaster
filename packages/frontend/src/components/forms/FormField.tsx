import React from 'react';

interface FormFieldProps {
  label?: string;
  name: string;
  value: string | number | boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  placeholder?: string;
  type?: string;
  autoFocus?: boolean;
  className?: string;
  required?: boolean;
  rows?: number;
  children?: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
  placeholder,
  type = 'text',
  autoFocus,
  className = '',
  required,
  rows,
  children
}) => {
  const baseInputClass = "w-full px-3 py-2 rounded border border-slate-700 bg-slate-900 text-slate-100";
  const inputClass = `${baseInputClass} ${className} ${touched && error ? 'border-red-500' : ''}`;
  
  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          name={name}
          value={value as string}
          onChange={onChange}
          onBlur={onBlur}
          className={inputClass}
          placeholder={placeholder}
          rows={rows || 3}
          required={required}
        />
      );
    } else if (type === 'select') {
      return (
        <select
          name={name}
          value={value as string}
          onChange={onChange}
          onBlur={onBlur}
          className={inputClass}
          required={required}
        >
          {children}
        </select>
      );
    } else {
      return (
        <input
          type={type}
          name={name}
          value={value as string | number}
          onChange={onChange}
          onBlur={onBlur}
          className={inputClass}
          placeholder={placeholder}
          autoFocus={autoFocus}
          required={required}
        />
      );
    }
  };

  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={name} className="block text-slate-300 text-sm mb-1">
          {label}{required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      {renderInput()}
      {touched && error && (
        <div className="text-red-400 text-sm mt-1">{error}</div>
      )}
    </div>
  );
};

export default FormField;
