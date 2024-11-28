import React from "react";
import { AlertContainer } from "../components/basic/alerts/AlertContainer";
import { AlertColor } from "@mui/material";

interface AlertContextProps {
  showAlert: (
    message: string,
    severity: AlertColor,
    hideDuration?: number
  ) => void;
}

export const AlertContext = React.createContext<AlertContextProps | null>(null);

export const useAlertContext = (): AlertContextProps => {
  const context = React.useContext(AlertContext);

  if (context === null) {
    throw new Error(
      "useAlertContext must be used within a AlertContextProvider"
    );
  }

  return context;
};

export const AlertContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [open, setOpen] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState("");
  const [alertSeverity, setAlertSeverity] =
    React.useState<AlertColor>("success");
  const [autoHideDuration, setAutoHideDuration] = React.useState(6000);

  const showAlert = (
    message: string,
    severity: AlertColor,
    autoHideDuration?: number
  ) => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAutoHideDuration(autoHideDuration ?? 6000);
    setOpen(true);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <AlertContainer
        open={open}
        setOpen={setOpen}
        alertMessage={alertMessage}
        alertSeverity={alertSeverity}
        autoHideDuration={autoHideDuration}
      ></AlertContainer>
    </AlertContext.Provider>
  );
};
