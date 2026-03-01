import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Description } from "@headlessui/react";
import React from "react";
import { Button } from "../../ui/Button";

interface ConfirmDialogProps {
    open: boolean;
    onConfirm: () => void;
    onClose: (isCancelled: boolean) => void;
    title: string;
    contentText: string;
    confirmLabel?: string;
    confirmIntent?: "accent" | "danger" | "primary";
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ open, onConfirm, onClose, title, contentText, confirmLabel = "Confirm", confirmIntent = "accent" }) => {
    return (
        <Dialog open={open} onClose={() => onClose(true)} className="fixed z-50 inset-0 overflow-y-auto">
            <DialogBackdrop className="fixed inset-0 bg-black/50" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="bg-surface-raised rounded-lg max-w-md mx-auto p-6 z-50 max-h-screen overflow-auto w-full shadow-elevated border border-border-default">
                    <DialogTitle className="text-lg font-semibold text-text-base">{title}</DialogTitle>
                    <Description className="mt-2 text-text-muted mb-4">{contentText}</Description>
                    <div className="mt-4 flex justify-end gap-2">
                        <Button intent="secondary" onClick={() => onClose(true)}>Cancel</Button>
                        <Button intent={confirmIntent} onClick={() => { onConfirm(); }}>{confirmLabel}</Button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};