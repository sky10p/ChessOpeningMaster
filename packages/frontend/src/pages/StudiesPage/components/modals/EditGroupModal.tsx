import React, { useEffect } from "react";
import { Button, Input } from "../../../../components/ui";
import { useFormState } from "../../../../hooks";

interface EditGroupModalProps {
  open: boolean;
  initialName: string;
  onClose: () => void;
  onSave: (name: string) => void;
  error?: string | null;
}

const EditGroupModal: React.FC<EditGroupModalProps> = ({ open, initialName, onClose, onSave, error }) => {
  const { values, handleChange, setForm } = useFormState({
    name: initialName,
  });

  useEffect(() => {
    if (open) {
      setForm({ name: initialName });
    }
  }, [initialName, open, setForm]);

  const handleSave = () => {
    onSave(values.name);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-page/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-border-default bg-surface-raised p-4 shadow-elevated sm:p-6">
        <h3 className="mb-4 text-lg font-bold text-text-base">Edit Group</h3>
        <Input
          label="Group name"
          placeholder="Group name"
          value={values.name}
          onChange={(event) => handleChange("name", event.target.value)}
          autoFocus
        />
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

export default EditGroupModal;
