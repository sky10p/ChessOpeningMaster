import { Chess, Move } from "chess.js";
import React, { useCallback, useEffect, useState } from "react";
import { MoveVariantNode } from "../components/chess/utils/VariantNode";
import { IMoveNode } from "../../common/types/MoveNode";
import { Variant } from "../components/chess/models/chess.models";
import { BoardOrientation } from "../../common/types/Orientation";
import { useAlertContext } from "./AlertContext";
import { putRepertoire } from "../repository/repertoires/repertoires";
import { toPGN } from "../components/chess/utils/pgn.utils";
import { useDialogContext } from "./DialogContext";

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
  saveRepertory: () => void;
  getPgn: () => string;
  updateRepertoire : () => void;
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
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  const {showSelectNextMoveDialog} = useDialogContext();

  useEffect(() => {
    const intervalSave = setInterval(()=>{
      if(hasChanges){
        saveRepertory();
        setHasChanges(false);
      }
    }, 500)

    return () => clearInterval(intervalSave);
  }, [hasChanges])

   

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

  const { showAlert } = useAlertContext();



  useEffect(() => {
    setMoveHistory(initialMoves
      ? MoveVariantNode.initMoveVariantNode(initialMoves)
      : new MoveVariantNode());

    chess.reset();
    

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
    if(currentMove.children.length === 1){
      const moveNode = currentMove.children[0];
      chess.move(moveNode.getMove());
      setCurrentMove(moveNode);
      updateVariants();
      return;
    }

    if(currentMove.children.length > 1){
      showSelectNextMoveDialog({
        title: "Select next move",
        contentText: "Select the movement to play",
        nextMovements: currentMove.children.map((child) => child.variantName ?? child.getMove().san),
        onNextMoveConfirm: (nextMove: string) => {
          const nextMoveVarianteNode = currentMove.children.find((child) => child.getMove().san === nextMove)
          if(!nextMoveVarianteNode) return;
          chess.move(nextMoveVarianteNode.getMove());
          setCurrentMove(nextMoveVarianteNode);
          updateVariants();
        },
      })
    }

    
  };

  const prev = () => {
    if (!currentMove.parent) return;
    setCurrentMove(currentMove.parent);
    chess.undo();
  };

  const addMove = (move: Move) => {
    const newMove = currentMove.addMove(move, undefined, undefined, () => setHasChanges(true));
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
    setHasChanges(true)
  };

  const deleteMove = (moveNode: MoveVariantNode) => {
    if (moveNode.parent === null) return;
    const parentNode = moveNode.parent;
    parentNode.children = parentNode.children.filter(
      (child) => child !== moveNode
    );

    goToMove(parentNode);
    updateVariants();
    setHasChanges(true)
  };

  const updateComment = (comment: string) => {
    setComment(comment);
    currentMove.comment = comment;
    setHasChanges(true)
  };

  const updateRepertoire = async () => {
    setCurrentMove(currentMove);
  }

  const saveRepertory = React.useCallback(async () => {
    try {
        showAlert("Saving repertoire...", "info");
        await putRepertoire(
            repertoireId,
            repertoireName,
            moveHistory.getMoveNodeWithoutParent(),
            orientation
        );
        showAlert("Repertoire saved successfully.", "success");
    } catch (error) {
        showAlert("Error saving repertoire.", "error");
    }
    }, [repertoireId, repertoireName, moveHistory, orientation, comment, showAlert]);

    const getPgn = useCallback(() => {
        const pgn = toPGN(repertoireName, new Date(), orientation, moveHistory);
        return pgn;
    }, [repertoireName, orientation, moveHistory])

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
    comment,
    updateComment,
    saveRepertory,
    getPgn,
    updateRepertoire,
    currentMoveNode: currentMove,

  };

  return (
    <RepertoireContext.Provider value={value}>{children}</RepertoireContext.Provider>
  );
};
