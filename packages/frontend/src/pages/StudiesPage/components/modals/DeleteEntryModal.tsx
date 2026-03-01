import React from "react";
import { Button } from "../../../../components/ui";

interface DeleteEntryModalProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  error?: string | null;
}

const DeleteEntryModal: React.FC<DeleteEntryModalProps> = ({ open, onClose, onDelete, error }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-page/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-border-default bg-surface-raised p-4 shadow-elevated sm:p-6">
        <h3 className="mb-4 text-lg font-bold text-text-base">Delete Entry</h3>
        <p className="mb-4 text-text-muted">Are you sure you want to delete this entry?</p>
        {error && <div className="mb-2 text-sm text-danger">{error}</div>}
        <div className="flex justify-end gap-2">
          <Button type="button" intent="danger" onClick={onDelete}>
            Delete
          </Button>
          <Button type="button" intent="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteEntryModal;
