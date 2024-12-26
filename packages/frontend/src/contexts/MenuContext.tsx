import React, { useCallback } from "react";
import { ActionsMenu } from "../components/design/ActionsMenu/ActionsMenu";

interface MenuContextProps {
  open: boolean;
  showMenu: (anchorEl: HTMLElement | null, items: {name: string, action: () => void}[]) => void;
  closeMenu: () => void;
  toggleMenu: (anchorEl: HTMLElement | null, items: {name: string, action: () => void}[]) => void;
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

interface MenuState {
    anchorEl: HTMLElement | null;
    open: boolean;
    items: { name: string; action: () => void }[];
}

type MenuAction =
    | { type: 'SHOW_MENU'; payload: { anchorEl: HTMLElement | null; items: { name: string; action: () => void }[] } }
    | { type: 'CLOSE_MENU' };

const initialState: MenuState = {
    anchorEl: null,
    open: false,
    items: [],
};

const reducer = (state: MenuState, action: MenuAction): MenuState => {
    switch (action.type) {
        case 'SHOW_MENU':
            return {
                anchorEl: action.payload.anchorEl,
                open: true,
                items: action.payload.items,
            };
        case 'CLOSE_MENU':
            return {
                ...state,
                open: false,
                anchorEl: null,
                items: [],
            };
        default:
            return state;
    }
};

export const MenuContextProvider: React.FC<MenuContextProviderProps> = ({
    children,
}) => {
    const [state, dispatch] = React.useReducer(reducer, initialState);

    const showMenu = useCallback((anchorEl: HTMLElement | null, items: { name: string; action: () => void }[]) => {
        dispatch({ type: 'SHOW_MENU', payload: { anchorEl, items } });
    }, []);

 
    const closeMenu = useCallback(() => {
        dispatch({ type: 'CLOSE_MENU' });
    }, []);

    const toggleMenu = useCallback((anchorEl: HTMLElement | null, items: { name: string; action: () => void }[]) => {
        if (state.open) {
            dispatch({ type: 'CLOSE_MENU' });
        } else {
            dispatch({ type: 'SHOW_MENU', payload: { anchorEl, items } });
        }
    }, [state.open]);

    return (
        <MenuContext.Provider
            value={{
                open: state.open,
                showMenu,
                closeMenu,
                toggleMenu,
            }}
        >
            {children}
            {state.open && (
                <ActionsMenu
                    anchorEl={state.anchorEl}
                    closeMenu={closeMenu}
                    items={state.items}
                />
            )}
        </MenuContext.Provider>
    );
};
