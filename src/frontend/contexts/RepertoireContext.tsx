import { Chess, Move } from "chess.js";
import React, { useEffect, useState } from "react";
import { MoveVariantNode } from "../components/chess/utils/VariantNode";
import { IMoveNode } from "../../common/types/MoveNode";
import { Variant } from "../components/chess/models/chess.models";
import { BoardOrientation } from "../../common/types/Orientation";

interface RepertoireContextProps {
  chess: Chess;
  orientation: "white" | "black";
  initBoard: () => void;
  setChess: (chess: Chess) => void;
  rotateBoard: () => void;
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
  comment: string;
  updateComment: (comment: string) => void;
}

const RepertoireContext = React.createContext<RepertoireContextProps | null>(null);

export const useRepertoireContext = () => {
  const context = React.useContext(RepertoireContext);

  if (!context) {
    throw new Error(
      "useBoardContext must be used within a BoardContextProvider"
    );
  }

  return context;
};

interface RepertoireContextProviderProps {
  children: React.ReactNode;
  repertoireId: string;
  repertoireName: string;
  initialOrientation: BoardOrientation;
  initialMoves?: IMoveNode;
}
export const RepertoireContextProvider: React.FC<RepertoireContextProviderProps> = ({
  children,
  repertoireId,
  repertoireName,
  initialOrientation,
  initialMoves,
}) => {
  const [chess, setChess] = useState<Chess>(new Chess());
  const [orientation, setOrientation] = useState<BoardOrientation>(initialOrientation);
  const [moveHistory, setMoveHistory] = useState<MoveVariantNode>(
    initialMoves
      ? MoveVariantNode.initMoveVariantNode(initialMoves)
      : new MoveVariantNode()
  );

  const [comment, setComment] = useState<string>("");

  const [variants, setVariants] = useState<Variant[]>(
    moveHistory.getVariants()
  );

  const [currentMove, setCurrentMove] = useState<MoveVariantNode>(moveHistory);


  useEffect(() => {
    setMoveHistory(initialMoves
      ? MoveVariantNode.initMoveVariantNode(initialMoves)
      : new MoveVariantNode());

  }, [initialMoves])

  useEffect(() => {
    setOrientation(initialOrientation);
  }, [initialOrientation])

  useEffect(() => {
    setCurrentMove(moveHistory);
    updateVariants();
  }, [moveHistory])

  useEffect(() => {
    setComment(currentMove.comment ?? "");
  }, [currentMove])

  const updateVariants = () => {
    setVariants(moveHistory.getVariants());
  };

  const initBoard = () => {
    const newChess = new Chess();
    setCurrentMove(moveHistory);
    setChess(newChess);
  };
  
  const rotateBoard = () => {
    setOrientation((prev) => (prev === "white" ? "black" : "white"));
  };
    
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

  const updateComment = (comment: string) => {
    setComment(comment);
    currentMove.comment = comment;
  };

  const value: RepertoireContextProps = {
    chess,
    orientation,
    initBoard,
    rotateBoard,
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
    comment,
    updateComment
  };

  return (
    <RepertoireContext.Provider value={value}>{children}</RepertoireContext.Provider>
  );
};
