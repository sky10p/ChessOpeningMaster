import { Snackbar, Alert as MuiAlert, AlertColor } from "@mui/material";
import React from "react";

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
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={() => setOpen(false)}
    >
      <MuiAlert
        onClose={() => setOpen(false)}
        severity={alertSeverity}
        sx={{ width: "100%" }}
      >
        {alertMessage}
      </MuiAlert>
    </Snackbar>
  );
};
