import { Chess, Move } from "chess.js";
import React, { useState } from "react";

interface BoardContextProps {
    chess: Chess;
    setChess: (chess: Chess) => void;
    next: () => void;
    prev: () => void;
    goToMove: (index: number) => void;
    currentIndex: () => number;
    hasNext: () => boolean;
    hasPrev: () => boolean;
    addMove: (move: Move) => void;
    getMovements: () => Move[];
    
}

const BoardContext = React.createContext<BoardContextProps | null>(null);

export const useBoardContext = () => {
    const context = React.useContext(BoardContext);

    if (!context) {
        throw new Error("useBoardContext must be used within a BoardContextProvider");
    }

    return context;
}

export const BoardContextProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const [chess, setChess] = useState<Chess>(new Chess());
    const [moveHistory, setMoveHistory] = useState<Move[]>([]);
    const [moveIndex, setMoveIndex] = useState<number>(-1);

    const next = () => {
        setMoveIndex(moveIndex + 1);
        chess.move(moveHistory[moveIndex+1]);
    }

    const prev = () => {
        setMoveIndex(moveIndex - 1);
        chess.undo();
    }

    const addMove = (move: Move) => {
        setMoveHistory([...moveHistory, move]);
        setMoveIndex(moveIndex + 1);
    }

    const hasNext = () => moveIndex < moveHistory.length - 1;

    const hasPrev = () => moveIndex > -1;

    const goToMove = (index: number) => {
        const newChess = new Chess();
        const moves = moveHistory.slice(0, index + 1);
        moves.forEach((move) => newChess.move(move));
        setChess(newChess);
        setMoveIndex(index);
    }


    const value: BoardContextProps = {
        chess,
        setChess,
        goToMove,
        next,
        prev,
        hasNext,
        hasPrev,
        addMove,
        currentIndex: () => moveIndex,
        getMovements: () => moveHistory
     }

    return (
        <BoardContext.Provider value={value}>
            {children}
        </BoardContext.Provider>
    )
}
