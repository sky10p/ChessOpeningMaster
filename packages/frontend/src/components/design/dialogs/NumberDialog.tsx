import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Description } from '@headlessui/react';
import React, { useEffect } from "react";

interface NumberDialogProps {
    open: boolean;
    min: number;
    max: number;
    initialValue: number;
    onNumberConfirm: (number: number) => void;
    onClose: (isCancelled: boolean) => void; // changed
    title: string;
    contentText: string;
}

export const NumberDialog: React.FC<NumberDialogProps> = ({ open, min, max, initialValue, onNumberConfirm, onClose, title, contentText }) => {
    const [value, setValue] = React.useState(initialValue);

    useEffect(() => {
        if (initialValue !== value) {
            setValue(initialValue);
        }
    }, [initialValue]);

    const handleConfirm = () => {
        const numericValue = Number(value);
        if (numericValue >= min && numericValue <= max) {
            onNumberConfirm(numericValue);
            onClose(false); // changed
        }
    };

    const isValidNumber = (num: number) => num >= min && num <= max;

    return (
        <Dialog open={open} onClose={() => onClose(true)} className="fixed z-10 inset-0 overflow-y-auto"> {/* changed */}
            <DialogBackdrop className="fixed inset-0 bg-black opacity-30" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="bg-background rounded max-w-md mx-auto p-6 z-20 max-h-screen overflow-auto">
                    <DialogTitle className="text-lg font-bold text-textLight">{title}</DialogTitle>
                    <Description className="mt-2 text-textLight mb-4">
                        {contentText}
                    </Description>
                    <input
                        type="number"
                        min={min}
                        max={max}
                        className="w-full px-3 py-2 border border-secondary rounded focus:outline-none focus:ring-2 focus:ring-accent"
                        value={value === 0 ? '' : value}
                        onChange={(e) => setValue(e.target.value === '' ? 0 : Number(e.target.value))}
                    />
                    <div className="mt-4 flex justify-end space-x-2">
                        <button onClick={() => onClose(true)} className="px-4 py-2 bg-secondary text-textLight rounded hover:bg-scrollbarThumbHover"> {/* changed */}
                            Cancel
                        </button>
                        <button onClick={handleConfirm} disabled={!isValidNumber(Number(value))} className={`px-4 py-2 rounded ${isValidNumber(Number(value)) ? 'bg-accent text-black hover:bg-accent' : 'bg-secondary text-textDark cursor-not-allowed'}`}>
                          Confirm
                        </button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};