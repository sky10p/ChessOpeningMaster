import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Description } from '@headlessui/react'
import React from "react"

interface MoveErrorDialogProps {
    open: boolean;
    onCountAsError: () => void;
    onIgnoreError: () => void;
    title: string;
    message: string;
}

export const MoveErrorDialog: React.FC<MoveErrorDialogProps> = ({
    open, 
    onCountAsError, 
    onIgnoreError, 
    title, 
    message
}) => {
    return (
        <Dialog 
            open={open} 
            onClose={onIgnoreError} 
            className="fixed z-50 inset-0 overflow-y-auto"
        >
            <DialogBackdrop className="fixed inset-0 bg-black opacity-30" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="bg-background rounded max-w-md mx-auto p-6 z-50 max-h-screen overflow-auto">
                    <DialogTitle className="text-lg font-bold text-textLight">{title}</DialogTitle>
                    <Description className="mt-2 text-textLight mb-4">
                        {message}
                    </Description>
                    <div className="mt-4 flex justify-end space-x-2">
                        <button 
                            onClick={onIgnoreError} 
                            className="px-4 py-2 bg-secondary text-textLight rounded hover:bg-scrollbarThumbHover"
                        >
                            Don't Count Error
                        </button>
                        <button 
                            onClick={onCountAsError} 
                            className="px-4 py-2 bg-accent text-black rounded hover:bg-accent"
                        >
                            Count As Error
                        </button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    )
}