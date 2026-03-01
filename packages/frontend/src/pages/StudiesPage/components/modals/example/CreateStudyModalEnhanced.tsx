import React from "react";
import { Button, Input, Select, Textarea } from "../../../../../components/ui";
import { useForm } from "../../../../../hooks";

interface CreateStudyModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (title: string, description: string, difficulty: string) => void;
  error?: string | null;
}

const CreateStudyModalEnhanced: React.FC<CreateStudyModalProps> = ({ open, onClose, onSave, error }) => {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    isValid,
  } = useForm(
    {
      title: "",
      description: "",
      difficulty: "medium",
    },
    {
      title: {
        required: true,
        minLength: 3,
        errorMessage: "Title is required and must be at least 3 characters",
      },
      description: {
        maxLength: 500,
        errorMessage: "Description must be less than 500 characters",
      },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-page/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-border-default bg-surface-raised p-4 shadow-elevated sm:p-6">
        <h3 className="mb-4 text-lg font-bold text-text-base">Create New Study</h3>
        <form onSubmit={handleSubmit(saveForm)}>
          <div className="space-y-3">
            <Input
              label="Title"
              placeholder="Title"
              value={values.title}
              onChange={(event) => handleChange("title", event.target.value)}
              onBlur={() => handleBlur("title")}
              error={Boolean(touched.title && errors.title)}
              errorMessage={touched.title ? errors.title : undefined}
              autoFocus
            />
            <Textarea
              label="Description"
              placeholder="Description"
              value={values.description}
              onChange={(event) => handleChange("description", event.target.value)}
              onBlur={() => handleBlur("description")}
              error={Boolean(touched.description && errors.description)}
              errorMessage={touched.description ? errors.description : undefined}
              rows={3}
            />
            <Select
              label="Difficulty"
              value={values.difficulty}
              onChange={(event) => handleChange("difficulty", event.target.value)}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </Select>
          </div>
          {error && <div className="mt-3 text-sm text-danger">{error}</div>}
          <div className="mt-4 flex justify-end gap-2">
            <Button type="submit" intent="primary" disabled={!isValid()}>
              Save
            </Button>
            <Button type="button" intent="secondary" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStudyModalEnhanced;
