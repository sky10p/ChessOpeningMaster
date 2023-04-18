import React from "react";
import { IRepertoire } from "../../common/types/Repertoire";
import { getRepertoires } from "../repository/repertoires/repertoires";

export type NavbarContextProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
    repertoires: IRepertoire[];
    updateRepertoires: () => void;
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
    const [repertoires, setRepertoires] = React.useState<IRepertoire[]>([]);

    const updateRepertoires = () => {
        getRepertoires().then((repertoires) => setRepertoires(repertoires));
    };
    return (
        <NavbarContext.Provider value={{ open, setOpen, repertoires, updateRepertoires }}>
            {children}
        </NavbarContext.Provider>
    );
};
