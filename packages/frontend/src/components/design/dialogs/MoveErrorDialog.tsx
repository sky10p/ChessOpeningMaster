import React from "react";
import {
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { Button } from "../../ui";

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
  message,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onIgnoreError}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <DialogBackdrop className="fixed inset-0 bg-black/70" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md rounded-lg border border-border-default bg-surface-raised p-5 shadow-elevated">
          <DialogTitle className="text-lg font-semibold text-text-base">
            {title}
          </DialogTitle>
          <Description className="mt-2 text-sm text-text-muted">
            {message}
          </Description>
          <div className="mt-4 flex justify-end gap-2">
            <Button intent="secondary" size="sm" onClick={onIgnoreError}>
              Don&apos;t Count Error
            </Button>
            <Button intent="accent" size="sm" onClick={onCountAsError}>
              Count As Error
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};
