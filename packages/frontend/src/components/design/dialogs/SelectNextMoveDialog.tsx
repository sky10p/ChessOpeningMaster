import { Dialog, DialogPanel, DialogTitle, RadioGroup, Radio, Field, Label } from '@headlessui/react';
import React from "react";
import { useState } from "react";

interface SelectNextMoveDialogProps {
  open: boolean;
  title: string;
  contentText: string;
  nextMovements: string[];
  onConfirm: (nextMove: string) => void;
  onClose: (isCancelled: boolean) => void; // changed
}

const SelectNextMoveDialog: React.FC<SelectNextMoveDialogProps> = ({
  open,
  title,
  contentText,
  nextMovements,
  onConfirm,
  onClose,
}) => {
  const [selectedNextMove, setSelectedNextMove] = useState<string>(nextMovements[0]);

  const handleNextMoveConfirm = () => {
    onConfirm(selectedNextMove);
    onClose(false); // changed
  };

  return (
    <Dialog open={open} onClose={() => onClose(true)} className="fixed z-10 inset-0 overflow-y-auto"> {/* changed */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-background rounded max-w-md mx-auto p-6 z-20 max-h-screen overflow-auto">
          <DialogTitle className="text-lg font-bold text-textLight">{title}</DialogTitle>
          <div className="mt-2 text-textLight mb-4">
            {contentText}
          </div>
          <div className="space-y-2">
            <RadioGroup value={selectedNextMove} onChange={setSelectedNextMove} aria-label="Next Move">
              {nextMovements.map((nextMove) => (
                <Field key={nextMove} className="flex items-baseline gap-2">
                  <Radio
                    value={nextMove}
                    className="group flex size-5 items-center justify-center rounded-full border bg-white data-[checked]:bg-blue-400"
                  >
                    <span className="invisible size-2 rounded-full bg-white group-data-[checked]:visible" />
                  </Radio>
                  <div>
                    <Label className="text-white">{nextMove}</Label>
                  </div>
                </Field>
              ))}
            </RadioGroup>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button onClick={() => onClose(true)} className="px-4 py-2 bg-secondary text-textLight rounded hover:bg-scrollbarThumbHover"> {/* changed */}
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
