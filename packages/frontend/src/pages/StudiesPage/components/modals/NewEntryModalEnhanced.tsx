import React from "react";
import { useForm, useFormField } from "../../../../hooks";
import { FormField } from "../../../../components/forms";

interface NewEntryModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (title: string, externalUrl: string, description: string) => void;
  error?: string | null;
}

const NewEntryModalEnhanced: React.FC<NewEntryModalProps> = ({ open, onClose, onSave, error }) => {
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
      title: "",
      externalUrl: "",
      description: ""
    },
    {
      title: {
        required: true,
        minLength: 3,
        errorMessage: "Title is required and must be at least 3 characters"
      },
      externalUrl: {
        required: true,
        pattern: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
        errorMessage: "Please enter a valid URL"
      }
    }
  );
  
  const { getFieldProps } = useFormField(values, errors, touched, handleChange, handleBlur);

  const handleSave = (formValues: typeof values) => {
    const { title, externalUrl, description } = formValues;
    onSave(title, externalUrl, description);
    reset();
  };
  
  const handleClose = () => {
    reset();
    onClose();
  };
  
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
      <div className="bg-slate-800 rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md mx-2">
        <h3 className="text-lg font-bold mb-4 text-white">Add Study</h3>
        <form onSubmit={handleSubmit(handleSave)}>
          <FormField
            {...getFieldProps('title')}
            placeholder="Title *"
            required
            autoFocus
          />
          
          <FormField
            {...getFieldProps('externalUrl')}
            placeholder="External study link *"
            required
          />
          
          <FormField
            {...getFieldProps('description')}
            placeholder="Description or comment"
            type="textarea"
            rows={3}
          />
          
          {error && <div className="text-red-400 mb-2">{error}</div>}
          <div className="flex gap-2 justify-end">
            <button 
              type="submit" 
              className="px-3 py-1 bg-blue-700 text-white rounded"
              disabled={!isValid()}
            >
              Save
            </button>
            <button
              type="button" 
              className="px-3 py-1 bg-slate-700 text-white rounded" 
              onClick={handleClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewEntryModalEnhanced;
