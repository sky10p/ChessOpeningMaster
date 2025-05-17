import React from "react";
import { useForm } from "../../../../../hooks";

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
    isValid  } = useForm(
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
      <div className="bg-slate-800 rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md mx-2">
        <h3 className="text-lg font-bold mb-4 text-white">Create New Study</h3>
        <form onSubmit={handleSubmit(saveForm)}>
          <div className="mb-3">
            <input
              className="w-full px-3 py-2 rounded border border-slate-700 bg-slate-900 text-slate-100"              placeholder="Title *"
              value={values.title}
              onChange={(e) => handleChange("title", e.target.value)}
              onBlur={() => handleBlur("title")}
              autoFocus
            />
            {touched.title && errors.title && (
              <div className="text-red-400 text-sm mt-1">{errors.title}</div>
            )}
          </div>
          
          <div className="mb-3">
            <textarea
              className="w-full px-3 py-2 rounded border border-slate-700 bg-slate-900 text-slate-100"
              placeholder="Description"
              value={values.description}
              onChange={(e) => handleChange("description", e.target.value)}
              onBlur={() => handleBlur("description")}
              rows={3}
            />
            {touched.description && errors.description && (
              <div className="text-red-400 text-sm mt-1">{errors.description}</div>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-slate-300 text-sm mb-1">Difficulty:</label>
            <select
              className="w-full px-3 py-2 rounded border border-slate-700 bg-slate-900 text-slate-100"
              value={values.difficulty}
              onChange={(e) => handleChange("difficulty", e.target.value)}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          
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
