import React, { useEffect } from "react";
import { AlertColor } from "./models";
import { Button } from "../../ui";


interface AlertContainerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  alertSeverity: AlertColor;
  alertMessage: string;
  autoHideDuration?: number;
}

export const Alert: React.FC<AlertContainerProps> = ({
  open,
  setOpen,
  alertSeverity,
  alertMessage,
  autoHideDuration = 6000,
}) => {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setOpen(false);
      }, autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [open, setOpen, autoHideDuration]);

  const severityStyles = {
    success: "border-success bg-surface text-text-base",
    error: "border-danger bg-surface text-text-base",
    warning: "border-warning bg-surface text-text-base",
    info: "border-brand bg-surface text-text-base",
  };

  return (
    open ? (
      <div
        className={`fixed left-3 right-3 z-[60] rounded-xl border-l-4 p-4 shadow-elevated transition transform duration-300 ease-in-out sm:left-4 sm:right-auto sm:max-w-md ${severityStyles[alertSeverity]} ${open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + var(--app-mobile-bottom-offset, 0px) + 0.75rem)" }}
      >
        <div className="flex items-start gap-3">
          <span className="flex-1 text-sm leading-6">{alertMessage}</span>
          <Button intent="ghost" size="sm" onClick={() => setOpen(false)} className="min-h-[32px] px-2 py-1">
            ×
          </Button>
        </div>
      </div>
    ) : null
  );
};
