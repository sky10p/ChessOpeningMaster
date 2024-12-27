import React, { useCallback } from "react";
import { HeaderIcon } from "../components/design/Header/models";

export interface HeaderStateContextProps {
    icons: HeaderIcon[];
    isSaving: boolean;
}

export interface HeaderDispatchContextProps {
    addIcon: (icon: HeaderIcon) => void;
    changeIconCallback: (key: string, onClick: (event: React.MouseEvent<HTMLElement>) => void) => void;
    removeIcon: (iconKey: string) => void;
    setIsSaving: (isSaving: boolean) => void;
}

export const HeaderStateContext = React.createContext<HeaderStateContextProps | null>(null);

export const HeaderDispatchContext = React.createContext<HeaderDispatchContextProps | null>(null);

export const useHeaderState = () => {
    const context = React.useContext(HeaderStateContext);
    if (!context) {
        throw new Error("useHeaderState must be used within a HeaderContextProvider");
    }
    return context;
}

export const useHeaderDispatch = () => {
    const context = React.useContext(HeaderDispatchContext);
    if (!context) {
        throw new Error("useHeaderDispatch must be used within a HeaderContextProvider");
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
        <HeaderStateContext.Provider value={{ icons, isSaving }}>
            <HeaderDispatchContext.Provider value={{ addIcon, removeIcon, changeIconCallback, setIsSaving }}>
                {children}
            </HeaderDispatchContext.Provider>
        </HeaderStateContext.Provider>
    );
};