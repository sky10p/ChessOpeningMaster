import React, { useState } from "react";

interface NewEntryModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (title: string, externalUrl: string, description: string) => void;
  error?: string | null;
}

const NewEntryModal: React.FC<NewEntryModalProps> = ({ open, onClose, onSave, error }) => {
  const [title, setTitle] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    onSave(title, externalUrl, description);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
      <div className="bg-slate-800 rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md mx-2">
        <h3 className="text-lg font-bold mb-4 text-white">Add Study</h3>
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

export default NewEntryModal;