import React from "react";

export type NavbarContextProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
};
export const NavbarContext = React.createContext<NavbarContextProps | null>(null);

export const useNavbarContext = (): NavbarContextProps => {
    const context = React.useContext(NavbarContext);

    if (context === null) {
        throw new Error("useNavbarContext must be used within a NavbarContextProvider");
    }

    return context;
}

export const NavbarContextProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const [open, setOpen] = React.useState(false);

    return (
        <NavbarContext.Provider value={{ open, setOpen }}>
            {children}
        </NavbarContext.Provider>
    );
};
