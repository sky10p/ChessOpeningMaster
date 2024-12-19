import React from "react";
import { ActionsMenu } from "../components/design/ActionsMenu/ActionsMenu";

interface MenuContextProps {
  showMenu: (anchorEl: HTMLElement | null, items: {name: string, action: () => void}[]) => void;
}

export const MenuContext = React.createContext<MenuContextProps | null>(null);

export const useMenuContext = (): MenuContextProps => {
  const context = React.useContext(MenuContext);

  if (context === null) {
    throw new Error("useMenuContext must be used within a MenuContextProvider");
  }

  return context;
};

interface MenuContextProviderProps {
    children: React.ReactNode;
}

export const MenuContextProvider: React.FC<MenuContextProviderProps> = ({
    children,
}) => {
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
    const [items, setItems] = React.useState<{name: string, action: () => void}[]>([]);

    const showMenu = (anchorEl: HTMLElement | null, items: {name: string, action: () => void}[]) => {
        setAnchorEl(anchorEl);
        setItems(items);
    };

    return (
        <MenuContext.Provider value={{ showMenu }}>
            {children}
            <ActionsMenu anchorEl={anchorEl} setAnchorEl={setAnchorEl} items={items}/>
        </MenuContext.Provider>
    );
};
