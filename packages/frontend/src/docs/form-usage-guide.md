# Form Usage Guide

This guide demonstrates how to use the custom form hooks and components in ChessKeep.

## Basic Form Implementation

Here's a complete example of a form using our custom hooks:

```tsx
import React from "react";
import { useForm } from "../hooks";
import { FormField } from "../components/forms";

interface ExampleFormProps {
  onSubmit: (values: { name: string; email: string; message: string }) => void;
}

const ExampleForm: React.FC<ExampleFormProps> = ({ onSubmit }) => {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    isValid
  } = useForm(
    {
      name: "",
      email: "",
      message: ""
    },
    {
      name: {
        required: true,
        minLength: 2,
        errorMessage: "Name is required and must be at least 2 characters"
      },
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        errorMessage: "Please enter a valid email address"
      }
    }
  );

  // Two approaches for form submission:

  // Option 1: Direct submission with handleSubmit
  const submitForm = handleSubmit((formValues) => {
    onSubmit(formValues);
    reset();
  });

  // Option 2: Custom submission handler
  const manualSubmit = () => {
    if (isValid()) {
      onSubmit(values);
      reset();
    }
  };

  return (
    <form onSubmit={submitForm}>
      {/* Option 1: Using FormField component */}
      <FormField
        label="Name"
        name="name"
        value={values.name}
        onChange={(e) => handleChange('name', e.target.value)}
        onBlur={() => handleBlur('name')}
        error={errors.name}
        touched={touched.name}
        placeholder="Enter your name"
        required
      />

      {/* Option 2: Using useFormField hook */}
      {/* 
      const { getFieldProps } = useFormField(values, errors, touched, handleChange, handleBlur);
      
      <FormField
        label="Name"
        {...getFieldProps('name')}
        placeholder="Enter your name"
        required
      />
      */}

      {/* Option 3: Manual implementation */}
      <div className="mb-3">
        <label htmlFor="email" className="block text-slate-300 text-sm mb-1">
          Email<span className="text-red-400 ml-1">*</span>
        </label>
        <input
          type="email"
          name="email"
          id="email"
          className={`w-full px-3 py-2 rounded border ${
            touched.email && errors.email ? 'border-red-500' : 'border-slate-700'
          } bg-slate-900 text-slate-100`}
          placeholder="Enter your email"
          value={values.email}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
        />
        {touched.email && errors.email && (
          <div className="text-red-400 text-sm mt-1">{errors.email}</div>
        )}
      </div>

      <textarea
        className={`w-full px-3 py-2 mb-3 rounded border ${
          touched.message && errors.message ? 'border-red-500' : 'border-slate-700'
        } bg-slate-900 text-slate-100`}
        placeholder="Your message"
        value={values.message}
        onChange={(e) => handleChange('message', e.target.value)}
        onBlur={() => handleBlur('message')}
        rows={3}
      />

      <div className="flex gap-2 justify-end">
        <button 
          type="submit"
          className="px-3 py-1 bg-blue-700 text-white rounded"
        >
          Submit
        </button>
        <button
          type="button"
          className="px-3 py-1 bg-slate-700 text-white rounded"
          onClick={reset}
        >
          Reset
        </button>
      </div>
    </form>
  );
};

export default ExampleForm;
```

## Modal Form Pattern

When implementing forms in modals, it's recommended to follow this pattern:

```tsx
import React from "react";
import { useForm } from "../hooks";

interface ModalFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: FormData) => void;
}

interface FormData {
  title: string;
  description: string;
}

const ModalForm: React.FC<ModalFormProps> = ({ open, onClose, onSave }) => {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    reset
  } = useForm<FormData>(
    {
      title: "",
      description: ""
    },
    {
      title: {
        required: true,
        minLength: 3,
        errorMessage: "Title is required and must be at least 3 characters"
      }
    }
  );

  const handleSave = () => {
    onSave(values);
    reset();
    onClose();
  };
  
  const handleClose = () => {
    reset();
    onClose();
  };

  if (!open) return null;
  
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>Modal Title</h3>
        
        <input
          className={`form-input ${touched.title && errors.title ? 'error' : ''}`}
          placeholder="Title *"
          value={values.title}
          onChange={(e) => handleChange('title', e.target.value)}
          onBlur={() => handleBlur('title')}
        />
        {touched.title && errors.title && <div className="error-text">{errors.title}</div>}
        
        <textarea
          className="form-input"
          placeholder="Description"
          value={values.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
        />
        
        <div className="button-group">
          <button onClick={handleSave}>Save</button>
          <button onClick={handleClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};
```

## Form Hooks Overview

### useFormState

Manages form state and provides basic form operations:

```tsx
const {
  values,            // Current form values
  handleChange,      // Update a specific field
  handleInputChange, // Handle native input change events
  resetForm,         // Reset form to initial values
  setForm,           // Set all form values at once
  isDirty,           // Whether form has been modified
  getValues          // Get current form values
} = useFormState(initialValues);
```

### useFormValidation

Handles form validation:

```tsx
const {
  errors,        // Validation errors by field
  touched,       // Which fields have been touched
  validateForm,  // Validate all fields and return errors
  handleBlur,    // Mark a field as touched on blur
  clearErrors,   // Clear all validation errors
  isValid        // Check if form is valid
} = useFormValidation(values, validationRules);
```

### useForm

Combines state and validation:

```tsx
const {
  values,           // Current form values
  errors,           // Validation errors by field
  touched,          // Which fields have been touched
  isDirty,          // Whether form has been modified
  handleChange,     // Update a specific field
  handleInputChange,// Handle native input change events
  handleBlur,       // Mark a field as touched on blur
  setForm,          // Set all form values at once
  reset,            // Reset form to initial state
  handleSubmit,     // Wrapper for form submission
  isValid,          // Check if form is valid
  getValues         // Get current form values
} = useForm(initialValues, validationRules);
```

### useFormField

Simplifies form field props:

```tsx
const { getFieldProps } = useFormField(values, errors, touched, handleChange, handleBlur);

// Usage:
<FormField {...getFieldProps('fieldName')} />
```

## Validation Rules

Validation rules are defined as an object where keys match form field names:

```tsx
const validationRules = {
  username: {
    required: true,
    minLength: 3,
    pattern: /^[a-zA-Z0-9]+$/,
    errorMessage: "Username must be at least 3 characters and contain only letters and numbers"
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    errorMessage: "Please enter a valid email address"
  },
  password: {
    required: true,
    minLength: 8,
    errorMessage: "Password must be at least 8 characters"
  }
};
```
