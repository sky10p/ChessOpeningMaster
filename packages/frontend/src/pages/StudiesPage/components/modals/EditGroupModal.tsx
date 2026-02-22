import React, { useEffect } from "react";
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
    name: initialName
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
      <div className="bg-surface-raised rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md mx-2">
        <h3 className="text-lg font-bold mb-4 text-white">Edit Group</h3>        <input
          className="w-full px-3 py-2 mb-3 rounded border border-border-default bg-surface text-text-base"
          placeholder="Group name *"
          value={values.name}
          onChange={(e) => handleChange('name', e.target.value)}
          autoFocus
        />
        {error && <div className="text-red-400 mb-2">{error}</div>}
        <div className="flex gap-2 justify-end">
          <button className="px-3 py-1 bg-blue-700 text-white rounded" onClick={handleSave}>
            Save
          </button>
          <button className="px-3 py-1 bg-slate-700 text-white rounded" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditGroupModal;