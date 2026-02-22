import React, { useEffect } from "react";
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
  error 
}) => {
  const { values, handleChange, setForm } = useFormState({
    title: initialTitle,
    externalUrl: initialExternalUrl,
    description: initialDescription
  });
  useEffect(() => {
    if (open) {
      setForm({
        title: initialTitle,
        externalUrl: initialExternalUrl,
        description: initialDescription
      });
    }
  }, [initialTitle, initialExternalUrl, initialDescription, open, setForm]);

  const handleSave = () => {
    const { title, externalUrl, description } = values;
    onSave(title, externalUrl, description);
  };
  
  const handleClose = () => {
    onClose();
  };
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
      <div className="bg-surface-raised rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md mx-2">
        <h3 className="text-lg font-bold mb-4 text-white">Edit Study</h3>        <input
          className="w-full px-3 py-2 mb-3 rounded border border-border-default bg-surface text-text-base"
          placeholder="Title *"
          value={values.title}
          onChange={(e) => handleChange('title', e.target.value)}
          autoFocus
        />
        <input
          className="w-full px-3 py-2 mb-3 rounded border border-border-default bg-surface text-text-base"
          placeholder="External study link *"
          value={values.externalUrl}
          onChange={(e) => handleChange('externalUrl', e.target.value)}
        />
        <textarea
          className="w-full px-3 py-2 mb-3 rounded border border-border-default bg-surface text-text-base"
          placeholder="Description or comment"
          value={values.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
        />
        {error && <div className="text-red-400 mb-2">{error}</div>}
        <div className="flex gap-2 justify-end">          <button className="px-3 py-1 bg-blue-700 text-white rounded" onClick={handleSave}>
            Save
          </button>
          <button className="px-3 py-1 bg-slate-700 text-white rounded" onClick={handleClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditEntryModal;