import React from "react";
import { AlertContextProvider } from "./AlertContext";
import { DialogContextProvider } from "./DialogContext";
import { HeaderContextProvider } from "./HeaderContext";
import { NavbarContextProvider } from "./NavbarContext";
import { FooterContextProvider } from "./FooterContext";

export const AppContext: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <AlertContextProvider>
      <DialogContextProvider>
        <NavbarContextProvider>
          <HeaderContextProvider>
            <FooterContextProvider>{children}</FooterContextProvider>
          </HeaderContextProvider>
        </NavbarContextProvider>
      </DialogContextProvider>
    </AlertContextProvider>
  );
};
