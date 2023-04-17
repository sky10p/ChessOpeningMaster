import { Chess, Move } from "chess.js";
import React, { useEffect, useState } from "react";
import { MoveVariantNode } from "./utils/VariantNode";
import { IMoveNode } from "../../../common/types/MoveNode";
import { Variant } from "./chess.models";

interface BoardContextProps {
  chess: Chess;
  setChess: (chess: Chess) => void;
  next: () => void;
  prev: () => void;
  goToMove: (moveNode: MoveVariantNode) => void;
  changeNameMove: (moveNode: MoveVariantNode, newName: string) => void;
  deleteMove: (moveNode: MoveVariantNode) => void;
  hasNext: () => boolean;
  hasPrev: () => boolean;
  addMove: (move: Move) => void;
  moveHistory: MoveVariantNode;
  repertoireId: string;
  repertoireName: string;
  variants: Variant[];
  currentMoveNode: MoveVariantNode;
}

const BoardContext = React.createContext<BoardContextProps | null>(null);

export const useBoardContext = () => {
  const context = React.useContext(BoardContext);

  if (!context) {
    throw new Error(
      "useBoardContext must be used within a BoardContextProvider"
    );
  }

  return context;
};

interface BoardContextProviderProps {
  children: React.ReactNode;
  repertoireId: string;
  repertoireName: string;
  initialMoves?: IMoveNode;
}
export const BoardContextProvider: React.FC<BoardContextProviderProps> = ({
  children,
  repertoireId,
  repertoireName,
  initialMoves,
}) => {
  const [chess, setChess] = useState<Chess>(new Chess());
  const [moveHistory, setMoveHistory] = useState<MoveVariantNode>(
    initialMoves
      ? MoveVariantNode.initMoveVariantNode(initialMoves)
      : new MoveVariantNode()
  );

  const [variants, setVariants] = useState<Variant[]>(
    moveHistory.getVariants()
  );

  useEffect(() => {
    setMoveHistory(initialMoves
      ? MoveVariantNode.initMoveVariantNode(initialMoves)
      : new MoveVariantNode());
  }, [initialMoves])

  useEffect(() => {
    updateVariants();
  }, [moveHistory])

  const updateVariants = () => {
    setVariants(moveHistory.getVariants());
  };

  const [currentMove, setCurrentMove] = useState<MoveVariantNode>(moveHistory);
  const next = () => {
    if (currentMove.children.length === 0) return;
    const moveNode = currentMove.children[0];
    chess.move(moveNode.getMove());
    setCurrentMove(moveNode);
  };

  const prev = () => {
    if (!currentMove.parent) return;
    setCurrentMove(currentMove.parent);
    chess.undo();
  };

  const addMove = (move: Move) => {
    const newMove = currentMove.addMove(move);
    setCurrentMove(newMove);
    updateVariants();
  };

  const hasNext = () => {
    return currentMove.children.length > 0;
  };

  const hasPrev = () => {
    return !!currentMove.parent;
  };

  const goToMove = (moveNode: MoveVariantNode) => {
    const newChess = new Chess();
    const moves = [];
    let currentNode = moveNode;
    while (currentNode.parent !== null) {
      moves.push(currentNode.getMove());
      currentNode = currentNode.parent;
    }
    moves.reverse();
    moves.forEach((move) => {
      newChess.move(move);
    });
    setChess(newChess);
    setCurrentMove(moveNode);
  };

  const changeNameMove = (moveNode: MoveVariantNode, newName: string) => {
    moveNode.variantName = newName;
    goToMove(moveNode);
    updateVariants();
  };

  const deleteMove = (moveNode: MoveVariantNode) => {
    if (moveNode.parent === null) return;
    const parentNode = moveNode.parent;
    parentNode.children = parentNode.children.filter(
      (child) => child !== moveNode
    );

    goToMove(parentNode);
    updateVariants();
  };

  const value: BoardContextProps = {
    chess,
    setChess,
    goToMove,
    changeNameMove,
    deleteMove,
    next,
    prev,
    hasNext,
    hasPrev,
    addMove,
    moveHistory,
    repertoireId,
    repertoireName,
    variants,
    currentMoveNode: currentMove,
  };

  return (
    <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
  );
};
