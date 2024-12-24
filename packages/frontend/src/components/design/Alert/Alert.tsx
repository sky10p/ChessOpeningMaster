import React, { useEffect } from "react";
import { AlertColor } from "./models";


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
    success: "bg-green-100 border-green-500 text-green-700",
    error: "bg-red-100 border-red-500 text-red-700",
    warning: "bg-yellow-100 border-yellow-500 text-yellow-700",
    info: "bg-blue-100 border-blue-500 text-blue-700",
  };

  return (
    open ? (
      <div className={`fixed bottom-4 left-4 border-l-4 p-4 ${severityStyles[alertSeverity]} rounded shadow-lg transition transform duration-300 ease-in-out ${open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <span>{alertMessage}</span>
        <button onClick={() => setOpen(false)} className="ml-4 text-gray-500">&times;</button>
      </div>
    ) : null
  );
};
