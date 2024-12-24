import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Description } from '@headlessui/react'
import React, { useEffect } from "react"

interface TextDialogProps {
    open: boolean;
    initialValue: string;
    onTextConfirm: (text: string) => void;
    onClose: (isCancelled: boolean) => void;
    title: string;
    contentText: string;
}

export const TextDialog: React.FC<TextDialogProps> = ({open, initialValue, onTextConfirm, onClose, title, contentText: contextText}) => {

    const [value, setValue] = React.useState(initialValue)

    useEffect(() => {
      if(initialValue && initialValue !== value){
        setValue(initialValue)
      }
    }, [initialValue])

    return (
        <Dialog open={open} onClose={() => onClose(true)} className="fixed z-50 inset-0 overflow-y-auto">
          <DialogBackdrop className="fixed inset-0 bg-black opacity-30" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel className="bg-background rounded max-w-md mx-auto p-6 z-50 max-h-screen overflow-auto">
              <DialogTitle className="text-lg font-bold text-textLight">{title}</DialogTitle>
              <Description className="mt-2 text-textLight">
                {contextText}
              </Description>
              <input
                type="text"
                className="mt-2 w-full px-3 py-2 border border-secondary rounded focus:outline-none focus:ring-2 focus:ring-accent"
                value={value}
                onChange={(event) => setValue(event.target.value)}
              />
              <div className="mt-4 flex justify-end space-x-2">
                <button onClick={() => onClose(true)} className="px-4 py-2 bg-secondary text-textLight rounded hover:bg-scrollbarThumbHover">
                  Cancel
                </button>
                <button onClick={() => onTextConfirm(value)} className="px-4 py-2 bg-accent text-black rounded hover:bg-accent hover:text-black">
                  Rename
                </button>
              </div>
            </DialogPanel>
          </div>
        </Dialog>
    )
}