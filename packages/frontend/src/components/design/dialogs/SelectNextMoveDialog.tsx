import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Description } from '@headlessui/react';
import {
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import React from "react";
import { useState } from "react";

interface SelectNextMoveDialogProps {
  open: boolean;
  title: string;
  contentText: string;
  nextMovements: string[];
  onConfirm: (nextMove: string) => void;
  onClose: () => void;
}

const SelectNextMoveDialog: React.FC<SelectNextMoveDialogProps> = ({
  open,
  title,
  contentText,
  nextMovements,
  onConfirm,
  onClose,
}) => {
  const [selectedNextMove, setSelectedNextMove] = useState<string >(nextMovements[0]);

  const handleNextMoveConfirm = () => {
    onConfirm(selectedNextMove);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} className="fixed z-10 inset-0 overflow-y-auto">
      <DialogBackdrop className="fixed inset-0 bg-black opacity-30" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-background rounded max-w-md mx-auto p-6 z-20 max-h-screen overflow-auto">
          <DialogTitle className="text-lg font-bold text-textLight">{title}</DialogTitle>
          <Description className="mt-2 text-textLight mb-4">
            {contentText}
          </Description>
          <div className="space-y-2">
            <RadioGroup value={selectedNextMove} onChange={(event) => setSelectedNextMove(event.target.value)}>
              {nextMovements.map((nextMove) => (
                <label key={nextMove} className="flex items-center">
                  <input
                    type="radio"
                    value={nextMove}
                    checked={selectedNextMove === nextMove}
                    onChange={(e) => setSelectedNextMove(e.target.value)}
                    className="form-radio h-4 w-4 text-accent"
                  />
                  <span className="ml-2 text-textLight">{nextMove}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button onClick={onClose} className="px-4 py-2 bg-secondary text-textLight rounded hover:bg-scrollbarThumbHover">
              Cancel
            </button>
            <button onClick={handleNextMoveConfirm} className="px-4 py-2 bg-accent text-black rounded hover:bg-accent">
              Confirm
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default SelectNextMoveDialog;
