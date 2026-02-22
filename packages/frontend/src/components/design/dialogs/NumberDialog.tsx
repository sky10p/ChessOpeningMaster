import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Description } from "@headlessui/react";
import React, { useEffect } from "react";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";

interface NumberDialogProps {
    open: boolean;
    min: number;
    max: number;
    initialValue: number;
    onNumberConfirm: (number: number) => void;
    onClose: (isCancelled: boolean) => void;
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
            onClose(false);
        }
    };

    const isValidNumber = (num: number) => num >= min && num <= max;

    return (
        <Dialog open={open} onClose={() => onClose(true)} className="fixed z-50 inset-0 overflow-y-auto">
            <DialogBackdrop className="fixed inset-0 bg-black/50" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="bg-surface-raised rounded-lg max-w-md mx-auto p-6 z-50 max-h-screen overflow-auto w-full shadow-elevated border border-border-default">
                    <DialogTitle className="text-lg font-semibold text-text-base">{title}</DialogTitle>
                    <Description className="mt-2 text-text-muted mb-4">{contentText}</Description>
                    <Input
                        type="number"
                        min={min}
                        max={max}
                        value={value === 0 ? "" : value}
                        onChange={(e) => setValue(e.target.value === "" ? 0 : Number(e.target.value))}
                    />
                    <div className="mt-4 flex justify-end gap-2">
                        <Button intent="secondary" onClick={() => onClose(true)}>Cancel</Button>
                        <Button intent="accent" disabled={!isValidNumber(Number(value))} onClick={handleConfirm}>Confirm</Button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};