import React from "react";
import { Button, Input } from "../../../../components/ui";
import { useFormState } from "../../../../hooks";

interface NewStudyModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, tags: string[]) => void;
  error?: string | null;
}

const NewStudyModal: React.FC<NewStudyModalProps> = ({ open, onClose, onSave, error }) => {
  const { values, handleChange, resetForm } = useFormState({
    name: "",
    tagString: "",
  });

  const handleSave = () => {
    const tags = values.tagString
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    onSave(values.name, tags);
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-page/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-border-default bg-surface-raised p-4 shadow-elevated sm:p-6">
        <h3 className="mb-4 text-lg font-bold text-text-base">New Study</h3>
        <div className="space-y-3">
          <Input
            label="Study name"
            placeholder="Study name"
            value={values.name}
            onChange={(event) => handleChange("name", event.target.value)}
            autoFocus
          />
          <Input
            label="Tags"
            placeholder="Comma-separated tags"
            value={values.tagString}
            onChange={(event) => handleChange("tagString", event.target.value)}
          />
        </div>
        {error && <div className="mt-3 text-sm text-danger">{error}</div>}
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" intent="primary" onClick={handleSave}>
            Save
          </Button>
          <Button type="button" intent="secondary" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewStudyModal;
