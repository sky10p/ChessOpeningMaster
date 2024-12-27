import React, { useCallback } from "react";
import { FooterIcon } from "../components/design/Footer/models";

export const FooterStateContext = React.createContext<{
    icons: FooterIcon[];
    isVisible: boolean;
} | null>(null);

export const FooterDispatchContext = React.createContext<{
    addIcon: (icon: FooterIcon) => void;
    removeIcon: (iconKey: string) => void;
    setIsVisible: (isVisible: boolean) => void;
} | null>(null);

export const FooterContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [icons, setIcons] = React.useState<FooterIcon[]>([]);
    const [isVisible, setIsVisible] = React.useState(false);

    const addIcon = useCallback((icon: FooterIcon) => {
        setIcons((prevIcons) => {
            if (prevIcons.find((i) => i.key === icon.key)) {
                throw new Error(`Icon with key ${icon.key} already exists`);
            }
            return [...prevIcons, icon];
        });
    }, []);

    const removeIcon = useCallback((iconKey: string) => {
        setIcons((prevIcons) => prevIcons.filter((icon) => icon.key !== iconKey));  
    }, []);

    return (
        <FooterStateContext.Provider value={{ icons, isVisible }}>
            <FooterDispatchContext.Provider value={{ addIcon, removeIcon, setIsVisible }}>
                {children}
            </FooterDispatchContext.Provider>
        </FooterStateContext.Provider>
    );
};

export const useFooterState = () => {
    const context = React.useContext(FooterStateContext);
    if (!context) {
        throw new Error("useFooterState must be used within a FooterContextProvider");
    }
    return context;
}

export const useFooterDispatch = () => {
    const context = React.useContext(FooterDispatchContext);
    if (!context) {
        throw new Error("useFooterDispatch must be used within a FooterContextProvider");
    }
    return context;
}