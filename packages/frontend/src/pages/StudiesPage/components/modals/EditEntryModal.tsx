import React, { useState, useEffect } from "react";

interface EditEntryModalProps {
  open: boolean;
  initialTitle: string;
  initialExternalUrl: string;
  initialDescription: string;
  onClose: () => void;
  onSave: (title: string, externalUrl: string, description: string) => void;
  error?: string | null;
}

const EditEntryModal: React.FC<EditEntryModalProps> = ({ open, initialTitle, initialExternalUrl, initialDescription, onClose, onSave, error }) => {
  const [title, setTitle] = useState(initialTitle);
  const [externalUrl, setExternalUrl] = useState(initialExternalUrl);
  const [description, setDescription] = useState(initialDescription);

  useEffect(() => {
    if (open) {
      setTitle(initialTitle);
      setExternalUrl(initialExternalUrl);
      setDescription(initialDescription);
    }
  }, [initialTitle, initialExternalUrl, initialDescription, open]);

  const handleSave = () => {
    onSave(title, externalUrl, description);
  };
  
  const handleClose = () => {
    onClose();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
      <div className="bg-slate-800 rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md mx-2">
        <h3 className="text-lg font-bold mb-4 text-white">Edit Study</h3>
        <input
          className="w-full px-3 py-2 mb-3 rounded border border-slate-700 bg-slate-900 text-slate-100"
          placeholder="Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
        <input
          className="w-full px-3 py-2 mb-3 rounded border border-slate-700 bg-slate-900 text-slate-100"
          placeholder="External study link *"
          value={externalUrl}
          onChange={(e) => setExternalUrl(e.target.value)}
        />
        <textarea
          className="w-full px-3 py-2 mb-3 rounded border border-slate-700 bg-slate-900 text-slate-100"
          placeholder="Description or comment"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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