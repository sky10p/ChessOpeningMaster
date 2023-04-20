import React from "react";
import { AlertContextProvider } from "./AlertContext";
import { DialogContextProvider } from "./DialogContext";
import { HeaderContextProvider } from "./HeaderContext";
import { NavbarContextProvider } from "./NavbarContext";

export const AppContext: React.FC<{children: React.ReactNode}> = ({children}) => {
    return (
        <AlertContextProvider>
        <DialogContextProvider>
          <NavbarContextProvider>
            <HeaderContextProvider>
                    {children}
            </HeaderContextProvider>
            </NavbarContextProvider>
        </DialogContextProvider>
        </AlertContextProvider>
    );
};