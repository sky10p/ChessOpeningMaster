import {
  Dialog,
  DialogPanel,
  DialogTitle,
  RadioGroup,
  Radio,
  Field,
  Label,
} from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import React, { useEffect, useMemo } from "react";
import { useState } from "react";

interface SelectNextMoveDialogProps {
  open: boolean;
  title: string;
  nextMovements: string[];
  selectedVariantMove?: string;
  onConfirm: (nextMove: string) => void;
  onClose: (isCancelled: boolean) => void;
}

const SelectNextMoveDialog: React.FC<SelectNextMoveDialogProps> = ({
  open,
  title,
  nextMovements,
  selectedVariantMove,
  onConfirm,
  onClose,
}) => {
  const memoizedNextMovements = useMemo(() => nextMovements, [nextMovements.join(',')]);
  
  const [selectedNextMove, setSelectedNextMove] = useState<string>(
    selectedVariantMove || memoizedNextMovements[0]
  );

  useEffect(() => {
    setSelectedNextMove(selectedVariantMove || memoizedNextMovements[0]);
  }, [selectedVariantMove, memoizedNextMovements]);

  const handleNextMoveConfirm = () => {
    onConfirm(selectedNextMove);
    onClose(false);
  };

  return (
    <Dialog
      open={open}
      onClose={() => onClose(true)}
      className="fixed z-50 inset-0 overflow-y-auto"
    >
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-background rounded max-w-md mx-auto p-6 z-50">
          <DialogTitle className="text-lg font-bold text-textLight mb-4">
            {title}
          </DialogTitle>

          <div className="space-y-2 mb-4">
            <RadioGroup value={selectedNextMove} onChange={setSelectedNextMove}>
              {memoizedNextMovements.map((nextMove) => (
                <Field
                  key={nextMove}
                  className="flex items-center gap-3 cursor-pointer"
                  aria-label={`Select chess move: ${nextMove}${
                    selectedVariantMove === nextMove
                      ? " (currently selected variant)"
                      : ""
                  }`}
                  aria-describedby={
                    selectedVariantMove === nextMove
                      ? `variant-indicator-${nextMove}`
                      : undefined
                  }
                >
                  <Radio
                    value={nextMove}
                    className="group flex size-4 items-center justify-center rounded-full border-2 border-gray-400 data-[checked]:border-blue-400 data-[checked]:bg-blue-400"
                    aria-label={`Choose ${nextMove} as next move`}
                  >
                    <span className="invisible size-2 rounded-full bg-white group-data-[checked]:visible" />
                  </Radio>
                  <div className="flex items-center justify-between w-full">
                    <Label
                      className={`cursor-pointer ${
                        selectedVariantMove === nextMove
                          ? "text-blue-400 font-bold"
                          : "text-white"
                      }`}
                    >
                      {nextMove}
                    </Label>
                    {selectedVariantMove === nextMove && (
                      <div
                        className="flex items-center gap-1"
                        id={`variant-indicator-${nextMove}`}
                        aria-label="This is the currently selected variant move"
                      >
                        <CheckCircleIcon className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-blue-400 font-medium">
                          Selected Variant
                        </span>
                      </div>
                    )}
                  </div>
                </Field>
              ))}
            </RadioGroup>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => onClose(true)}
              className="px-4 py-2 text-textLight rounded hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleNextMoveConfirm}
              className="px-4 py-2 bg-accent text-black rounded hover:bg-yellow-500"
            >
              Choose
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default SelectNextMoveDialog;
