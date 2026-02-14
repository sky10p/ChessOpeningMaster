import React, { useCallback, useReducer } from "react";
import { getRepertoires } from "../repository/repertoires/repertoires";
import { IRepertoire } from "@chess-opening-master/common";

// Define initial state and reducer
const initialState = {
    open: false,
    repertoires: [] as IRepertoire[],
    updatedRepertoires: false,
};

type Action =
    | { type: 'SET_OPEN'; payload: boolean }
    | { type: 'SET_REPERTOIRES'; payload: IRepertoire[] }
    | { type: 'SET_UPDATED_REPERTOIRES'; payload: boolean };

const reducer = (state: typeof initialState, action: Action) => {
    switch (action.type) {
        case 'SET_OPEN':
            return { ...state, open: action.payload };
        case 'SET_REPERTOIRES':
            return { ...state, repertoires: action.payload, updatedRepertoires: true };
        case 'SET_UPDATED_REPERTOIRES':
            return { ...state, updatedRepertoires: action.payload };
        default:
            return state;
    }
};

// Create separate contexts for state and dispatch
export const NavbarStateContext = React.createContext<typeof initialState | null>(null);
export const NavbarDispatchContext = React.createContext<{
    setOpen: (open: boolean) => void;
    updateRepertoires: () => void;
} | null>(null);

export const useNavbarState = (): typeof initialState => {
    const state = React.useContext(NavbarStateContext);
    if (state === null) {
        throw new Error("useNavbarState must be used within a NavbarContextProvider");
    }
    return state;
}

export const useNavbarDispatch = () => {
    const context = React.useContext(NavbarDispatchContext);
    if (context === null) {
        throw new Error("useNavbarDispatch must be used within a NavbarContextProvider");
    }
    return context;
}

export const NavbarContextProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    const updateRepertoires = async () => {
        try {
            const repertoires = await getRepertoires();
            dispatch({ type: 'SET_REPERTOIRES', payload: repertoires });
        } catch {
            dispatch({ type: 'SET_REPERTOIRES', payload: [] });
        }
    };

    const setOpen = useCallback((open: boolean) => {
        dispatch({ type: 'SET_OPEN', payload: open });
    }, []);

    React.useEffect(() => {
        updateRepertoires();
    }, []);

    return (
        <NavbarStateContext.Provider value={state}>
            <NavbarDispatchContext.Provider value={{ setOpen, updateRepertoires}}>
                {children}
            </NavbarDispatchContext.Provider>
        </NavbarStateContext.Provider>
    );
};
