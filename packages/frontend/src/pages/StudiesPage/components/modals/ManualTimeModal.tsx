import React from "react";
import { Button, Input, Textarea } from "../../../../components/ui";
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
    manualDate: new Date().toISOString().slice(0, 10),
  });

  const handleSave = () => {
    const { manualMinutes, manualComment, manualDate } = values;
    void onSave(manualMinutes, manualComment, manualDate);
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-page/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-border-default bg-surface-raised p-4 shadow-elevated sm:p-6">
        <h3 className="mb-4 text-lg font-bold text-text-base">Add Manual Time</h3>
        <div className="space-y-3">
          <Input
            label="Duration"
            placeholder="2h, 30m, 1:30, 2 min"
            hint="Plain numbers default to hours."
            value={values.manualMinutes}
            onChange={(event) => handleChange("manualMinutes", event.target.value)}
            autoFocus
          />
          <Textarea
            label="Comment"
            placeholder="Optional note"
            rows={2}
            value={values.manualComment}
            onChange={(event) => handleChange("manualComment", event.target.value)}
          />
          <Input
            label="Date"
            type="date"
            value={values.manualDate}
            onChange={(event) => handleChange("manualDate", event.target.value)}
          />
        </div>
        {error && <div className="mt-3 text-sm text-danger">{error}</div>}
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" intent="primary" onClick={handleSave}>
            Save
          </Button>
          <Button type="button" intent="secondary" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ManualTimeModal;
