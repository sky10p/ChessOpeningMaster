import { Chess, Move } from "chess.js";
import React, { useState } from "react";
import { MoveVariantNode } from "./utils/VariantNode";

interface BoardContextProps {
    chess: Chess;
    setChess: (chess: Chess) => void;
    next: () => void;
    prev: () => void;
    goToMove: (moveNode: MoveVariantNode) => void;
    hasNext: () => boolean;
    hasPrev: () => boolean;
    addMove: (move: Move) => void;
    moveHistory: MoveVariantNode;
    currentMoveNode: MoveVariantNode;
    
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
    const [moveHistory] = useState<MoveVariantNode>(new MoveVariantNode());
    const [currentMove, setCurrentMove] = useState<MoveVariantNode>(moveHistory);
    const next = () => {
        if(currentMove.children.length === 0) return;
        const moveNode = currentMove.children[0];
        chess.move(moveNode.getMove());
        setCurrentMove(moveNode);


    }

    const prev = () => {
        if(!currentMove.parent) return;
        setCurrentMove(currentMove.parent);
        chess.undo();
    }

    const addMove = (move: Move) => {
        const newMove = currentMove.addMove(move);
        setCurrentMove(newMove);
    }

    const hasNext = () => {
        return currentMove.children.length > 0;
    }

    const hasPrev = () =>{
        return !!currentMove.parent;
    }

    const goToMove = (moveNode: MoveVariantNode) => {
        const newChess = new Chess();
        const moves = [];
        let currentNode = moveNode;
        while(currentNode.parent !== null){
            moves.push(currentNode.getMove());
            currentNode = currentNode.parent;
        }
        moves.reverse();
        moves.forEach(move => {
            newChess.move(move);
        })
        setChess(newChess);
        setCurrentMove(moveNode);
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
        moveHistory,
        currentMoveNode: currentMove
     }

    return (
        <BoardContext.Provider value={value}>
            {children}
        </BoardContext.Provider>
    )
}
