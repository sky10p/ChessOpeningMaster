import React from "react";

interface HeaderIcon {
    key: string;
    icon: React.ReactNode;
    onClick: () => void;
}

export interface HeaderContextProps {
    icons: HeaderIcon[];
    addIcon: (icon: HeaderIcon) => void;
    removeIcon: (iconKey: string) => void;
}

export const HeaderContext = React.createContext<HeaderContextProps | null>(null);

export const useHeaderContext = () => {
    const context = React.useContext(HeaderContext);
    if (!context) {
        throw new Error("HeaderContext must be used within a HeaderContextProvider");
    }
    return context;
}

export const HeaderContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [icons, setIcons] = React.useState<HeaderIcon[]>([]);

    const addIcon = (icon: HeaderIcon) => {
        if(icons.find((i) => i.key === icon.key)){
            throw new Error(`Icon with key ${icon.key} already exists`);
        }
        setIcons((prevIcons) => [...prevIcons, icon]);
    };

    const removeIcon = (iconKey: string) => {
        setIcons((prevIcons) => prevIcons.filter((icon) => icon.key !== iconKey));  
    };
    return (
        <HeaderContext.Provider value={{icons, addIcon, removeIcon }}>
            {children}
        </HeaderContext.Provider>
    );
};