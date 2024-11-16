import React, { useCallback } from "react";

interface FooterIcon {
    key: string;
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
}

export interface FooterContextProps {
    icons: FooterIcon[];
    addIcon: (icon: FooterIcon) => void;
    removeIcon: (iconKey: string) => void;
    isVisible: boolean;
    setIsVisible: (isVisible: boolean) => void;
}

export const FooterContext = React.createContext<FooterContextProps | null>(null);

export const useFooterContext = () => {
    const context = React.useContext(FooterContext);
    if (!context) {
        throw new Error("FooterContext must be used within a FooterContextProvider");
    }
    return context;
}

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
        <FooterContext.Provider value={{icons, addIcon, removeIcon, isVisible, setIsVisible }}>
            {children}
        </FooterContext.Provider>
    );
};