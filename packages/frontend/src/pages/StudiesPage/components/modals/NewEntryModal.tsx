import React from "react";
import { useForm } from "../../../../hooks";

interface NewEntryModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (title: string, externalUrl: string, description: string) => void;
  error?: string | null;
}

const NewEntryModal: React.FC<NewEntryModalProps> = ({ open, onClose, onSave, error }) => {    const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    reset,
    isValid
  } = useForm(
    {
      title: "",
      externalUrl: "",
      description: ""
    },    {
      title: {
        required: true,
        minLength: 3,
        errorMessage: "Title is required and must be at least 3 characters"
      },
      externalUrl: {
        required: false,
        custom: (value) => {
          if (!value || (value as string).trim() === '') return true;
          return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(value as string);
        },
        errorMessage: "Please enter a valid URL"
      }
    }
  );
    const handleSave = () => {
    const formIsValid = isValid();
    
    if (formIsValid) {
      onSave(values.title, values.externalUrl, values.description);
      reset();
    } else {
      Object.keys(values).forEach(key => {
        handleBlur(key as keyof typeof values);
      });
    }
  };
    const handleClose = () => {
    reset();
    onClose();
  };
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
      <div className="bg-surface-raised rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md mx-2">
        <h3 className="text-lg font-bold mb-4 text-white">Add Study</h3>        <input
          className={`w-full px-3 py-2 mb-3 rounded border ${touched.title && errors.title ? 'border-red-500' : 'border-border-default'} bg-surface text-text-base`}
          placeholder="Title *"
          value={values.title}
          onChange={(e) => handleChange('title', e.target.value)}
          onBlur={() => handleBlur('title')}
          autoFocus
        />
        {touched.title && errors.title && <div className="text-red-400 text-sm mt-1 mb-2">{errors.title}</div>}        <input
          className={`w-full px-3 py-2 mb-3 rounded border ${touched.externalUrl && errors.externalUrl ? 'border-red-500' : 'border-border-default'} bg-surface text-text-base`}
          placeholder="External study link (optional)"
          value={values.externalUrl}
          onChange={(e) => handleChange('externalUrl', e.target.value)}
          onBlur={() => handleBlur('externalUrl')}
        />
        {touched.externalUrl && errors.externalUrl && <div className="text-red-400 text-sm mt-1 mb-2">{errors.externalUrl}</div>}        <textarea
          className={`w-full px-3 py-2 mb-3 rounded border ${touched.description && errors.description ? 'border-red-500' : 'border-border-default'} bg-surface text-text-base`}
          placeholder="Description or comment"
          value={values.description}
          onChange={(e) => handleChange('description', e.target.value)}
          onBlur={() => handleBlur('description')}
          rows={3}
        />
        {touched.description && errors.description && <div className="text-red-400 text-sm mt-1 mb-2">{errors.description}</div>}
        {error && <div className="text-red-400 mb-2">{error}</div>}
        <div className="flex gap-2 justify-end">          <button className="px-3 py-1 bg-blue-700 text-white rounded" onClick={handleSave}>
            Save
          </button>
          <button className="px-3 py-1 bg-slate-700 text-white rounded" onClick={handleClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewEntryModal;