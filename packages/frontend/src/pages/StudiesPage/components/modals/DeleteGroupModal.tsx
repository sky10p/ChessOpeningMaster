import React from "react";

interface DeleteGroupModalProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  error?: string | null;
}

const DeleteGroupModal: React.FC<DeleteGroupModalProps> = ({ open, onClose, onDelete, error }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
      <div className="bg-surface-raised rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md mx-2">
        <h3 className="text-lg font-bold mb-4 text-white">Delete Group</h3>
        <p className="mb-4 text-text-muted">Are you sure you want to delete this group and all its studies?</p>
        {error && <div className="text-red-400 mb-2">{error}</div>}
        <div className="flex gap-2 justify-end">
          <button className="px-3 py-1 bg-red-700 text-white rounded" onClick={onDelete}>
            Delete
          </button>
          <button className="px-3 py-1 bg-slate-700 text-white rounded" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteGroupModal;