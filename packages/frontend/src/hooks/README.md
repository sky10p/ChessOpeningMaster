# Custom Hooks

This directory contains reusable custom hooks for the Chess Opening Master application.

## Available Hooks

### useFormState

A custom hook for managing form state with support for validation, resetting, and tracking dirty state.

#### Features

- Type-safe form state management
- Handles different input types (text, number, checkbox)
- Form reset functionality
- Dirty state tracking
- Simplified input change handling
- No need for type casting when accessing form values

#### Usage

```tsx
import { useFormState } from '../hooks';

function MyFormComponent() {
  const { 
    values, 
    handleChange, 
    handleInputChange, 
    resetForm, 
    setForm,
    isDirty 
  } = useFormState({
    name: '',
    email: '',
    age: 0,
    isActive: true
  });

  const handleSubmit = () => {
    // No type casting needed
    const { name, email, age, isActive } = values;
    console.log(name, email, age, isActive);
    resetForm();
  };

  return (
    <form>
      <input
        name="name"
        value={values.name} // No need for type casting
        onChange={handleInputChange}
      />
      
      {/* Alternative approach with explicit field name */}
      <input
        value={values.email} // No need for type casting
        onChange={(e) => handleChange('email', e.target.value)}
      />
      
      <button type="button" onClick={handleSubmit}>
        Submit
      </button>
      
      {isDirty && (
        <button type="button" onClick={resetForm}>
          Reset
        </button>
      )}
    </form>
  );
}
```

### useFormValidation

A custom hook for form validation with support for various validation rules.

#### Features

- Comprehensive validation rules (required, minLength, maxLength, pattern, custom)
- Field-level validation
- Form-level validation
- Tracking touched fields
- Custom error messages

#### Usage

```tsx
import { useFormState, useFormValidation } from '../hooks';

function MyValidatedForm() {
  const { values, handleChange, resetForm } = useFormState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const { 
    errors, 
    touched, 
    validateForm, 
    handleBlur, 
    isValid 
  } = useFormValidation(values, {
    username: {
      required: true,
      minLength: 3,
      errorMessage: 'Username is required and must be at least 3 characters'
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      errorMessage: 'Valid email is required'
    },
    password: {
      required: true,
      minLength: 8,
      errorMessage: 'Password must be at least 8 characters'
    },
    confirmPassword: {
      required: true,
      custom: (value, formValues) => value === formValues.password,
      errorMessage: 'Passwords must match'
    }
  });

  const handleSubmit = () => {
    const validationErrors = validateForm(values);
    
    if (Object.keys(validationErrors).length === 0) {
      // Form is valid, proceed with submission
      console.log('Form submitted:', values);
      resetForm();
    }
  };

  return (
    <form>
      <div>
        <input
          value={values.username as string}
          onChange={(e) => handleChange('username', e.target.value)}
          onBlur={() => handleBlur('username')}
        />
        {touched.username && errors.username && (
          <div className="error">{errors.username}</div>
        )}
      </div>
      
      {/* More inputs with validation... */}
      
      <button 
        type="button" 
        onClick={handleSubmit}
        disabled={!isValid(values)}
      >
        Submit
      </button>
    </form>
  );
}
```

### useForm

A combined hook that provides complete form management with state handling and validation in one package.

#### Features

- All features from useFormState and useFormValidation combined
- Simplified form submission handling
- Reset functionality that clears both values and errors
- Automatic form validation on submit
- No need for type casting when accessing form values

#### Usage

```tsx
import { useForm } from '../hooks';

function MyCompleteForm() {
  const {
    values,
    errors,
    touched,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    isValid
  } = useForm(
    {
      username: '',
      email: '',
      password: ''
    },
    {
      username: {
        required: true,
        minLength: 3,
        errorMessage: 'Username must be at least 3 characters'
      },
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        errorMessage: 'Valid email is required'
      },
      password: {
        required: true,
        minLength: 8,
        errorMessage: 'Password must be at least 8 characters'
      }
    }
  );

  const submitForm = (formValues) => {
    // Access form values directly without type casting
    const { username, email, password } = formValues;
    console.log('Form submitted successfully:', username, email, password);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(submitForm)}>
      <div>
        <input
          value={values.username} // No need for type casting
          onChange={(e) => handleChange('username', e.target.value)}
          onBlur={() => handleBlur('username')}
        />
        {touched.username && errors.username && (
          <div className="error">{errors.username}</div>
        )}
      </div>
      
      {/* More form fields... */}
      
      <div className="buttons">
        <button type="submit" disabled={!isValid()}>
          Submit
        </button>
        {isDirty && (
          <button type="button" onClick={reset}>
            Reset
          </button>
        )}
      </div>
    </form>
  );
}
```
