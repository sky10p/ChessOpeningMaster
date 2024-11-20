import React, { useCallback } from "react";

interface HeaderIcon {
    key: string;
    icon: React.ReactNode;
    onClick: (event: React.MouseEvent<HTMLElement>) => void;
}

export interface HeaderContextProps {
    icons: HeaderIcon[];
    addIcon: (icon: HeaderIcon) => void;
    changeIconCallback: (key: string, onClick: (event: React.MouseEvent<HTMLElement>) => void) => void;
    removeIcon: (iconKey: string) => void;
    isSaving: boolean;
    setIsSaving: (isSaving: boolean) => void;
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
    const [isSaving, setIsSaving] = React.useState(false);

    const addIcon = useCallback((icon: HeaderIcon) => {
        setIcons((prevIcons) => {
            if (prevIcons.find((i) => i.key === icon.key)) {
                throw new Error(`Icon with key ${icon.key} already exists`);
            }
            return [...prevIcons, icon];
        });
    }, []);

    const changeIconCallback = useCallback((key: string, onClick: (event: React.MouseEvent<HTMLElement>) => void) => {
        setIcons((prevIcons) => {
            const iconIndex = prevIcons.findIndex((i) => i.key === key);
            if (iconIndex !== -1) {
                const updatedIcons = [...prevIcons];
                updatedIcons[iconIndex] = { ...updatedIcons[iconIndex], onClick };
                return updatedIcons;
            }
            return prevIcons;
        });
    }, []);

    const removeIcon = useCallback((iconKey: string) => {
        setIcons((prevIcons) => prevIcons.filter((icon) => icon.key !== iconKey));
    }, []);

    return (
        <HeaderContext.Provider value={{ icons, addIcon, removeIcon, changeIconCallback, isSaving, setIsSaving }}>
            {children}
        </HeaderContext.Provider>
    );
};