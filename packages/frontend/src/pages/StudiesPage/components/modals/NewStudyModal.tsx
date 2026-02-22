import React from "react";
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
    tagString: ""
  });
  const handleSave = () => {
    const { name, tagString } = values;
    const tags = tagString.split(",").map(t => t.trim()).filter(Boolean);
    onSave(name, tags);
    resetForm();
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
      <div className="bg-surface-raised rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md mx-2">
        <h3 className="text-lg font-bold mb-4 text-text-base">New Study</h3>        <input
          className="w-full px-3 py-2 mb-3 rounded border border-border-default bg-surface text-text-base"
          placeholder="Study name *"
          value={values.name}
          onChange={(e) => handleChange('name', e.target.value)}
          autoFocus
        />
        <input
          className="w-full px-3 py-2 mb-3 rounded border border-border-default bg-surface text-text-base"
          placeholder="Tags (comma separated)"
          value={values.tagString}
          onChange={(e) => handleChange('tagString', e.target.value)}
        />
        {error && <div className="text-danger mb-2">{error}</div>}
        <div className="flex gap-2 justify-end">          <button className="px-3 py-1 bg-brand text-text-on-brand rounded" onClick={handleSave}>
            Save
          </button>
          <button className="px-3 py-1 bg-surface-raised text-text-base border border-border-default rounded" onClick={handleClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewStudyModal;