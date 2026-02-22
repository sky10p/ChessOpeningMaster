import React from "react";
import { useFormState } from "../../../../hooks";

interface ManualTimeModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (manualMinutes: string, manualComment: string, manualDate: string) => Promise<void>;
  error?: string | null;
}

const ManualTimeModal: React.FC<ManualTimeModalProps> = ({ open, onClose, onSave, error }) => {
  const { values, handleChange, resetForm } = useFormState({
    manualMinutes: "",
    manualComment: "",
    manualDate: new Date().toISOString().substr(0, 10)
  });
  const handleSave = () => {
    const { manualMinutes, manualComment, manualDate } = values;
    onSave(manualMinutes, manualComment, manualDate);
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
        <h3 className="text-lg font-bold mb-4 text-white">Add manual time</h3>        <input
          className="w-full px-3 py-2 mb-1 rounded border border-border-default bg-surface text-text-base"
          placeholder="Ej: 2h, 30m, 1:30, 2 (por defecto horas)"
          value={values.manualMinutes}
          onChange={e => handleChange('manualMinutes', e.target.value)}
          autoFocus
        />
        <div className="text-xs text-text-subtle mb-2">You can write: 2h, 30m, 1:30, 2 min, 2 (defaults to hours)</div>
        <textarea
          className="w-full px-3 py-2 mb-3 rounded border border-border-default bg-surface text-text-base"
          placeholder="Comentario (opcional)"
          value={values.manualComment}
          onChange={e => handleChange('manualComment', e.target.value)}
          rows={2}
        />
        <div className="mb-2">
          <label className="block text-text-muted text-sm mb-1">Fecha:</label>
          <input
            type="date"
            className="w-full px-3 py-2 rounded border border-border-default bg-surface text-text-base"
            value={values.manualDate}
            onChange={e => handleChange('manualDate', e.target.value)}
          />
        </div>
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

export default ManualTimeModal;