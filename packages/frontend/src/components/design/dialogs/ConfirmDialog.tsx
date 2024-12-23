import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Description } from '@headlessui/react'
import React from "react"

interface TextDialogProps {
    open: boolean;
    onConfirm: () => void;
    onClose: () => void;
    title: string;
    contentText: string;
}

export const ConfirmDialog: React.FC<TextDialogProps> = ({open, onConfirm, onClose, title, contentText: contextText}) => {

    return (
        <Dialog open={open} onClose={onClose} className="fixed z-10 inset-0 overflow-y-auto">
            <DialogBackdrop className="fixed inset-0 bg-black opacity-30" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="bg-background rounded max-w-md mx-auto p-6 z-20 max-h-screen overflow-auto">
                    <DialogTitle className="text-lg font-bold text-textLight">{title}</DialogTitle>
                    <Description className="mt-2 text-textLight mb-4">
                        {contextText}
                    </Description>
                    <div className="mt-4 flex justify-end space-x-2">
                        <button onClick={onClose} className="px-4 py-2 bg-secondary text-textLight rounded hover:bg-scrollbarThumbHover">
                            Cancel
                        </button>
                        <button onClick={onConfirm} className="px-4 py-2 bg-accent text-black rounded hover:bg-accent">
                            Confirm
                        </button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    )
}