import React from "react";
import { Button, Input, Textarea } from "../../../../components/ui";
import { useForm } from "../../../../hooks";

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
    isValid,
  } = useForm(
    {
      title: "",
      externalUrl: "",
      description: "",
    },
    {
      title: {
        required: true,
        minLength: 3,
        errorMessage: "Title is required and must be at least 3 characters",
      },
      externalUrl: {
        required: true,
        pattern: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
        errorMessage: "Please enter a valid URL",
      },
    }
  );

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-page/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-border-default bg-surface-raised p-4 shadow-elevated sm:p-6">
        <h3 className="mb-4 text-lg font-bold text-text-base">Add Entry</h3>
        <form onSubmit={handleSubmit(handleSave)}>
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
            <Input
              label="External study link"
              placeholder="https://..."
              value={values.externalUrl}
              onChange={(event) => handleChange("externalUrl", event.target.value)}
              onBlur={() => handleBlur("externalUrl")}
              error={Boolean(touched.externalUrl && errors.externalUrl)}
              errorMessage={touched.externalUrl ? errors.externalUrl : undefined}
            />
            <Textarea
              label="Description"
              placeholder="Description or comment"
              rows={3}
              value={values.description}
              onChange={(event) => handleChange("description", event.target.value)}
              onBlur={() => handleBlur("description")}
            />
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

export default NewEntryModalEnhanced;
