import React, { useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Description } from "@headlessui/react";
import { IRepertoire } from "@chess-opening-master/common";
import { Button } from "../../ui/Button";
import { Select } from "../../ui/Select";

interface RepertoireDialogProps {
  open: boolean;
  title: string;
  contentText: string;
  repertoires: IRepertoire[];
  onConfirm: (repertoire: IRepertoire) => void;
  onClose: (isCancelled: boolean) => void;
}

const RepertoireDialog: React.FC<RepertoireDialogProps> = ({ open, title, contentText, repertoires, onConfirm, onClose }) => {
  const [selectedRepertoire, setSelectedRepertoire] = useState<IRepertoire | null>(repertoires.length > 0 ? repertoires[0] : null);

  const handleRepertoireConfirm = () => {
    if (selectedRepertoire) {
      onConfirm(selectedRepertoire);
    }
    onClose(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = repertoires.find(r => r._id === e.target.value);
    if (selected) {
      setSelectedRepertoire(selected);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose(true)} className="fixed z-50 inset-0 overflow-y-auto">
      <DialogBackdrop className="fixed inset-0 bg-black/50" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-surface-raised rounded-lg max-w-md mx-auto p-6 z-50 max-h-screen overflow-auto w-full shadow-elevated border border-border-default">
          <DialogTitle className="text-lg font-semibold text-text-base">{title}</DialogTitle>
          <Description className="mt-2 text-text-muted mb-4">{contentText}</Description>
          <div className="mt-4">
            <Select
              label="Repertoire"
              value={selectedRepertoire ? selectedRepertoire._id : ""}
              onChange={handleChange}
            >
              {repertoires.map((repertoire) => (
                <option key={repertoire._id} value={repertoire._id}>
                  {repertoire.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button intent="secondary" onClick={() => onClose(true)}>Cancel</Button>
            <Button intent="accent" disabled={!selectedRepertoire} onClick={handleRepertoireConfirm}>Confirm</Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default RepertoireDialog;