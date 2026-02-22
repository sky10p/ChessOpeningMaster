import React from "react";
import { useForm, useFormField } from "../../../../../hooks";
import { FormField } from "../../../../../components/forms";

interface CreateStudyModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (title: string, description: string, difficulty: string) => void;
  error?: string | null;
}

const CreateStudyModal: React.FC<CreateStudyModalProps> = ({ open, onClose, onSave, error }) => {
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
      description: "",
      difficulty: "medium"
    },
    {
      title: {
        required: true,
        minLength: 3,
        errorMessage: "Title is required and must be at least 3 characters"
      },
      description: {
        maxLength: 500,
        errorMessage: "Description must be less than 500 characters"
      }
    }
  );
  
  const { getFieldProps } = useFormField(values, errors, touched, handleChange, handleBlur);

  const saveForm = (formValues: typeof values) => {
    const { title, description, difficulty } = formValues;
    onSave(title, description, difficulty);
    reset();
    onClose();
  };
  
  const handleClose = () => {
    reset();
    onClose();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
      <div className="bg-surface-raised rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md mx-2">
        <h3 className="text-lg font-bold mb-4 text-white">Create New Study</h3>
        <form onSubmit={handleSubmit(saveForm)}>
          <FormField
            {...getFieldProps('title')}
            placeholder="Title *"
            required
            autoFocus
          />
          
          <FormField
            {...getFieldProps('description')}
            placeholder="Description"
            type="textarea"
            rows={3}
          />
          
          <FormField
            label="Difficulty"
            {...getFieldProps('difficulty')}
            type="select"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </FormField>
          
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

export default CreateStudyModal;
