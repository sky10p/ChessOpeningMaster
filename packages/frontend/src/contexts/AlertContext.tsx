import React, { useCallback } from "react";
import { Alert } from "../components/design/Alert/Alert";
import { AlertColor } from "../components/design/Alert/models";

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
  const [alertState, setAlertState] = React.useState({
    open: false,
    alertMessage: "",
    alertSeverity: "success" as AlertColor,
    autoHideDuration: 6000,
  });

  const showAlert = useCallback(
    (
      message: string,
      severity: AlertColor,
      autoHideDuration?: number
    ) => {
      setAlertState({
        open: true,
        alertMessage: message,
        alertSeverity: severity,
        autoHideDuration: autoHideDuration ?? 6000,
      });
    },
    []
  );

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <Alert
        open={alertState.open}
        setOpen={() => setAlertState(prev => ({ ...prev, open: false }))}
        alertMessage={alertState.alertMessage}
        alertSeverity={alertState.alertSeverity}
        autoHideDuration={alertState.autoHideDuration}
      ></Alert>
    </AlertContext.Provider>
  );
};
