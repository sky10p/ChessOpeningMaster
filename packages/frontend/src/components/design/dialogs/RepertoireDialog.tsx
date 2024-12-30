import React, { useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Description } from "@headlessui/react";
import { IRepertoire } from "@chess-opening-master/common";

interface RepertoireDialogProps {
  open: boolean;
  title: string;
  contentText: string;
  repertoires: IRepertoire[];
  onConfirm: (repertoire: IRepertoire) => void;
  onClose: (isCancelled: boolean) => void; // changed
}

const RepertoireDialog: React.FC<RepertoireDialogProps> = ({ open, title, contentText, repertoires, onConfirm, onClose }) => {
  const [selectedRepertoire, setSelectedRepertoire] = useState<IRepertoire | null>(repertoires.length > 0 ? repertoires[0] : null);

  const handleRepertoireConfirm = () => {
    if (selectedRepertoire) {
      onConfirm(selectedRepertoire);
    }
    onClose(false); // changed
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = repertoires.find(r => r._id === e.target.value);
    if (selected) {
      setSelectedRepertoire(selected);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose(true)} className="fixed z-50 inset-0 overflow-y-auto"> {/* changed */}
      <DialogBackdrop className="fixed inset-0 bg-black opacity-30" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-background rounded max-w-md mx-auto p-6 z-50 max-h-screen overflow-auto"> {/* changed */}
          <DialogTitle className="text-lg font-bold text-textLight">{title}</DialogTitle>
          <Description className="mt-2 text-textLight mb-4">
            {contentText}
          </Description>
          <div className="mt-4">
            <label className="block text-textLight mb-2">Repertoire</label>
            <select
              value={selectedRepertoire ? selectedRepertoire._id : ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-secondary rounded bg-background text-textLight focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {repertoires.map((repertoire) => (
                <option key={repertoire._id} value={repertoire._id}>
                  {repertoire.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button onClick={() => onClose(true)} className="px-4 py-2 bg-secondary text-textLight rounded hover:bg-scrollbarThumbHover"> {/* changed */}
              Cancel
            </button>
            <button onClick={handleRepertoireConfirm} disabled={!selectedRepertoire} className={`px-4 py-2 rounded ${selectedRepertoire ? 'bg-accent text-black hover:bg-accent' : 'bg-secondary text-textDark cursor-not-allowed'}`}>
              Confirm
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default RepertoireDialog;