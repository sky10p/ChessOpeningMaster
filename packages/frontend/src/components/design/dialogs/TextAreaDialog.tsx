// filepath: d:\Documentos\node\ChessOpeningMaster\packages\frontend\src\components\design\dialogs\TextAreaDialog.tsx
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Description } from "@headlessui/react";
import React, { useEffect } from "react";
import { Button } from "../../ui/Button";
import { Textarea } from "../../ui/Input";

interface TextAreaDialogProps {
    open: boolean;
    initialValue: string;
    onTextConfirm: (text: string) => void;
    onClose: (isCancelled: boolean) => void;
    title: string;
    contentText: string;
    rows?: number;
}

export const TextAreaDialog: React.FC<TextAreaDialogProps> = ({
    open,
    initialValue,
    onTextConfirm,
    onClose,
    title,
    contentText,
    rows = 5,
}) => {
    const [value, setValue] = React.useState(initialValue);

    useEffect(() => {
        if (initialValue && initialValue !== value) {
            setValue(initialValue);
        }
    }, [initialValue]);

    return (
        <Dialog open={open} onClose={() => onClose(true)} className="fixed z-50 inset-0 overflow-y-auto">
            <DialogBackdrop className="fixed inset-0 bg-black/50" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="bg-surface-raised rounded-lg max-w-md mx-auto p-6 z-50 max-h-screen overflow-auto w-full shadow-elevated border border-border-default">
                    <DialogTitle className="text-lg font-semibold text-text-base">{title}</DialogTitle>
                    <Description className="mt-2 text-text-muted">{contentText}</Description>
                    <Textarea
                        className="mt-3"
                        value={value}
                        rows={rows}
                        onChange={(event) => setValue(event.target.value)}
                    />
                    <div className="mt-4 flex justify-end gap-2">
                        <Button intent="secondary" onClick={() => onClose(true)}>Cancel</Button>
                        <Button intent="accent" onClick={() => onTextConfirm(value)}>Save</Button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};