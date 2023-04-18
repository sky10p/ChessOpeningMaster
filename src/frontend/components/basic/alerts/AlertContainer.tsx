import { Snackbar, Alert, AlertColor } from "@mui/material"
import React from "react"

interface AlertContainerProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    alertSeverity: AlertColor;
    alertMessage: string;
}

export const AlertContainer: React.FC<AlertContainerProps> = ({open, setOpen, alertSeverity, alertMessage}) => {
    return <Snackbar open={open} autoHideDuration={6000} onClose={() => setOpen(false)}>
    <Alert onClose={() => setOpen(false)} severity={alertSeverity} sx={{ width: '100%' }}>
      {alertMessage}
    </Alert>
  </Snackbar>
}