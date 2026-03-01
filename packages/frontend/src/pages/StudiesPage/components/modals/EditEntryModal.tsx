import React, { useEffect } from "react";
import { Button, Input, Textarea } from "../../../../components/ui";
import { useFormState } from "../../../../hooks";

interface EditEntryModalProps {
  open: boolean;
  initialTitle: string;
  initialExternalUrl: string;
  initialDescription: string;
  onClose: () => void;
  onSave: (title: string, externalUrl: string, description: string) => void;
  error?: string | null;
}

const EditEntryModal: React.FC<EditEntryModalProps> = ({
  open,
  initialTitle,
  initialExternalUrl,
  initialDescription,
  onClose,
  onSave,
  error,
}) => {
  const { values, handleChange, setForm } = useFormState({
    title: initialTitle,
    externalUrl: initialExternalUrl,
    description: initialDescription,
  });

  useEffect(() => {
    if (open) {
      setForm({
        title: initialTitle,
        externalUrl: initialExternalUrl,
        description: initialDescription,
      });
    }
  }, [initialDescription, initialExternalUrl, initialTitle, open, setForm]);

  const handleSave = () => {
    onSave(values.title, values.externalUrl, values.description);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-page/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-border-default bg-surface-raised p-4 shadow-elevated sm:p-6">
        <h3 className="mb-4 text-lg font-bold text-text-base">Edit Entry</h3>
        <div className="space-y-3">
          <Input
            label="Title"
            placeholder="Title"
            value={values.title}
            onChange={(event) => handleChange("title", event.target.value)}
            autoFocus
          />
          <Input
            label="External study link"
            placeholder="https://..."
            value={values.externalUrl}
            onChange={(event) => handleChange("externalUrl", event.target.value)}
          />
          <Textarea
            label="Description"
            placeholder="Description or comment"
            rows={3}
            value={values.description}
            onChange={(event) => handleChange("description", event.target.value)}
          />
        </div>
        {error && <div className="mt-3 text-sm text-danger">{error}</div>}
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" intent="primary" onClick={handleSave}>
            Save
          </Button>
          <Button type="button" intent="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditEntryModal;
