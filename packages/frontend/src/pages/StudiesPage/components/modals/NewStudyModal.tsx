import React, { useState } from "react";

interface NewStudyModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, tags: string[]) => void;
  error?: string | null;
}

const NewStudyModal: React.FC<NewStudyModalProps> = ({ open, onClose, onSave, error }) => {
  const [name, setName] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const handleSave = () => {
    onSave(name, tags);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
      <div className="bg-slate-800 rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md mx-2">
        <h3 className="text-lg font-bold mb-4 text-white">New Study</h3>
        <input
          className="w-full px-3 py-2 mb-3 rounded border border-slate-700 bg-slate-900 text-slate-100"
          placeholder="Study name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <input
          className="w-full px-3 py-2 mb-3 rounded border border-slate-700 bg-slate-900 text-slate-100"
          placeholder="Tags (comma separated)"
          value={tags.join(", ")}
          onChange={(e) => setTags(e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
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

export default NewStudyModal;