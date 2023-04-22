import React from "react";

interface HeaderIcon {
    key: string;
    icon: React.ReactNode;
    onClick: (event: React.MouseEvent<HTMLElement>) => void;
}

export interface HeaderContextProps {
    icons: HeaderIcon[];
    addIcon: (icon: HeaderIcon) => void;
    changeIconCallback: (key: string, onClick: () => void) => void;
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
        setIcons((prevIcons) => [...prevIcons, icon]);
    };

    const changeIconCallback = (key: string, onClick: () => void) => {
        const icon = icons.find((i) => i.key === key);

        if(icon){
            icon.onClick = onClick;
            setIcons([...icons])

        }
    }

    const removeIcon = (iconKey: string) => {
        setIcons((prevIcons) => prevIcons.filter((icon) => icon.key !== iconKey));  
    };
    return (
        <HeaderContext.Provider value={{icons, addIcon, removeIcon, changeIconCallback }}>
            {children}
        </HeaderContext.Provider>
    );
};