import { Chess, Move } from "chess.js";
import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { MoveVariantNode } from "../models/VariantNode";
import { Variant } from "../models/chess.models";
import { useAlertContext } from "./AlertContext";
import { putRepertoire } from "../repository/repertoires/repertoires";
import { toPGN } from "../utils/chess/pgn/pgn.utils";
import { useDialogContext } from "./DialogContext";
import { useHeaderDispatch } from "./HeaderContext";
import {
  BoardOrientation,
  getOrientationAwareFen,
  IMoveNode,
} from "@chess-opening-master/common";
import {
  getPositionComment,
  updatePositionComment,
} from "../repository/positions/positions";

interface RepertoireContextProps {
  chess: Chess;
  orientation: BoardOrientation;
  initBoard: () => void;
  setChess: (chess: Chess) => void;
  rotateBoard: () => void;
  next: () => void;
  nextFollowingVariant: () => void;
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
  updateComment: (comment: string) => Promise<void>;
  saveRepertory: () => void;
  getPgn: () => Promise<string>;
  updateRepertoire: () => void;
  selectedVariant: Variant | null;
  setSelectedVariant: (variant: Variant | null) => void;
}

const RepertoireContext = React.createContext<RepertoireContextProps | null>(
  null
);

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
  updateRepertoire: () => void;
}
export const RepertoireContextProvider: React.FC<
  RepertoireContextProviderProps
> = ({
  children,
  repertoireId,
  repertoireName,
  initialOrientation,
  initialMoves,
  updateRepertoire,
}) => {
  const [chess, setChess] = useState<Chess>(new Chess());
  const [orientation, setOrientation] =
    useState<BoardOrientation>(initialOrientation);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  const { setIsSaving } = useHeaderDispatch();

  const { showSelectNextMoveDialog } = useDialogContext();

  useEffect(() => {
    const intervalSave = setInterval(() => {
      if (hasChanges) {
        saveRepertory();
        setHasChanges(false);
      }
    }, 500);

    return () => clearInterval(intervalSave);
  }, [hasChanges]);

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

  const location = useLocation();

  const variantNameFromUrl = React.useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("variantName");
  }, [location.search]);

  const getInitialSelectedVariant = React.useCallback((availableVariants: Variant[]): Variant | null => {
    if (availableVariants.length === 0) return null;
    
    const pathVariant = availableVariants.find(
      (variant) => variant.name === variantNameFromUrl || variant.fullName === variantNameFromUrl
    );
    
    return pathVariant ?? availableVariants[0];
  }, [variantNameFromUrl]);

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    getInitialSelectedVariant(moveHistory.getVariants())
  );
  const { showAlert } = useAlertContext();

  useEffect(() => {
    const newMoveHistory = initialMoves
      ? MoveVariantNode.initMoveVariantNode(initialMoves)
      : new MoveVariantNode();
    
    setMoveHistory(newMoveHistory);
    
    const newVariants = newMoveHistory.getVariants();
    const newSelectedVariant = getInitialSelectedVariant(newVariants);
    setSelectedVariant(newSelectedVariant);

    chess.reset();
  }, [initialMoves, getInitialSelectedVariant]);

  useEffect(() => {
    setOrientation(initialOrientation);
  }, [initialOrientation]);
  useEffect(() => {
    const loadComment = async () => {
      try {
        const fen = getOrientationAwareFen(chess.fen(), orientation);
        const positionComment = await getPositionComment(fen);
        setComment(positionComment || "");
      } catch (error) {
        console.error("Error loading position comment:", error);
        setComment("");
      }
    };

    loadComment();
  }, [currentMove, orientation]);

  const getSelectedVariantMove = useCallback(() => {
    if (!selectedVariant || currentMove.position >= selectedVariant.moves.length) {
      return undefined;
    }
    return selectedVariant.moves[currentMove.position].getMove().san;
  }, [selectedVariant, currentMove.position]);

  const isValidSelectedVariantPosition = useCallback(() => {
    return !!(selectedVariant && currentMove.position < selectedVariant.moves.length);
  }, [selectedVariant, currentMove.position]);

  const getSelectedVariantMoveNode = useCallback(() => {
    if (!isValidSelectedVariantPosition() || !selectedVariant) {
      return undefined;
    }
    return selectedVariant.moves[currentMove.position];
  }, [selectedVariant, currentMove.position, isValidSelectedVariantPosition]);

  const isCurrentVariantMove = (
    moveNode: MoveVariantNode,
    isValidSelectedVariantPosition: () => boolean,
    getSelectedVariantMoveNode: () => MoveVariantNode | undefined
  ) => {
    return !!isValidSelectedVariantPosition() && 
           moveNode.id === getSelectedVariantMoveNode()?.id;
  };

  const executeMove = (moveNode: MoveVariantNode) => {
    chess.move(moveNode.getMove());
    setCurrentMove(moveNode);
    updateVariants(moveNode);
  };

  const findVariantContainingMove = (moveNode: MoveVariantNode) => {
    return variants.find(
      (variant) =>
        variant.moves.length > currentMove.position &&
        variant.moves[currentMove.position].id === moveNode.id
    );
  };

  const findMoveNodeBySan = (san: string) => {
    return currentMove.children.find(
      (child) => child.getMove().san === san
    );
  };

  const buildMovePath = (moveNode: MoveVariantNode): Move[] => {
    const moves: Move[] = [];
    let currentNode = moveNode;
    while (currentNode.parent !== null) {
      moves.push(currentNode.getMove());
      currentNode = currentNode.parent;
    }
    return moves.reverse();
  };

  const markChanges = () => setHasChanges(true);

  const hasNoChildren = () => currentMove.children.length === 0;
  const hasSingleChild = () => currentMove.children.length === 1;

  const isVariantCompatibleWithNode = (
    variant: Variant,
    node: MoveVariantNode
  ) => {
    if (variant.moves.length < node.position) return false;
    let currentNode: MoveVariantNode | null = node;
    let index = node.position - 1;
    while (currentNode && currentNode.parent) {
      if (variant.moves[index]?.id !== currentNode.id) return false;
      currentNode = currentNode.parent;
      index -= 1;
    }
    return true;
  };

  const findBestVariantForNode = useCallback(
    (variants: Variant[], targetNode: MoveVariantNode): Variant | null => {
      if (variants.length === 0) return null;

      const updatedSelectedVariant = selectedVariant
        ? variants.find((variant) => variant.fullName === selectedVariant.fullName)
        : null;

      if (
        updatedSelectedVariant &&
        isVariantCompatibleWithNode(updatedSelectedVariant, targetNode)
      ) {
        return updatedSelectedVariant;
      }

      const compatibleVariant = variants.find((variant) =>
        isVariantCompatibleWithNode(variant, targetNode)
      );

      return compatibleVariant ?? getInitialSelectedVariant(variants);
    },
    [selectedVariant, getInitialSelectedVariant]
  );

  const updateVariants = useCallback(
    (targetNode?: MoveVariantNode) => {
      const newVariants = moveHistory.getVariants();
      setVariants(newVariants);

      const nodeToEvaluate = targetNode ?? currentMove;
      const bestVariant = findBestVariantForNode(newVariants, nodeToEvaluate);
      setSelectedVariant(bestVariant);
    },
    [moveHistory, currentMove, findBestVariantForNode]
  );

  useEffect(() => {
    setCurrentMove(moveHistory);
    updateVariants(moveHistory);
  }, [moveHistory]);

  const initBoard = () => {
    const newChess = new Chess();
    setCurrentMove(moveHistory);
    setChess(newChess);
  };

  const rotateBoard = () => {
    setOrientation((prev) => (prev === "white" ? "black" : "white"));
  };

  const next = () => {
    if (hasNoChildren()) return;
    
    if (hasSingleChild()) {
      executeMove(currentMove.children[0]);
      return;
    }

    const selectedVariantMove = getSelectedVariantMove();

    showSelectNextMoveDialog({
      title: "Select next move",
      nextMovements: currentMove.children.map((child) => child.getMove().san),
      selectedVariantMove,
      onNextMoveConfirm: (nextMove: string) => {
        const nextMoveVarianteNode = findMoveNodeBySan(nextMove);
        if (!nextMoveVarianteNode) return;

        const isSelectedVariantMove = isCurrentVariantMove(
          nextMoveVarianteNode,
          isValidSelectedVariantPosition,
          getSelectedVariantMoveNode
        );

        if (isSelectedVariantMove) {
          executeMove(nextMoveVarianteNode);
          return;
        }

        const newSelectedVariant = findVariantContainingMove(nextMoveVarianteNode) || null;
        setSelectedVariant(newSelectedVariant);
        executeMove(nextMoveVarianteNode);
      },
    });
  };

  const nextFollowingVariant = () => {
    if (hasNoChildren()) return;
    
    if (isValidSelectedVariantPosition()) {
      const nextMoveInSelectedVariant = getSelectedVariantMoveNode();
      const nextMoveVarianteNode = currentMove.children.find(
        (child) => child.id === nextMoveInSelectedVariant?.id
      );
      
      if (nextMoveVarianteNode) {
        executeMove(nextMoveVarianteNode);
        return;
      }
    }
    
    if (hasSingleChild()) {
      executeMove(currentMove.children[0]);
      return;
    }
    
    next();
  };
  const prev = () => {
    if (!currentMove.parent) return;
    setCurrentMove(currentMove.parent);
    chess.undo();
    updateVariants(currentMove.parent);
  };

  const addMove = (move: Move) => {
    const newMove = currentMove.addMove(move, undefined, undefined, markChanges);
    chess.move(move);
    setCurrentMove(newMove);
    updateVariants(newMove);
  };

  const hasNext = () => {
    return !hasNoChildren();
  };

  const hasPrev = () => {
    return !!currentMove.parent;
  };
  const goToMove = (moveNode: MoveVariantNode) => {
    const newChess = new Chess();
    const moves = buildMovePath(moveNode);
    moves.forEach((move) => newChess.move(move));
    setChess(newChess);
    setCurrentMove(moveNode);
    updateVariants(moveNode);
  };
  const changeNameMove = (moveNode: MoveVariantNode, newName: string) => {
    moveNode.variantName = newName === "" ? undefined : newName;
    goToMove(moveNode);
    markChanges();
  };

  const deleteMove = (moveNode: MoveVariantNode) => {
    if (moveNode.parent === null) return;
    const parentNode = moveNode.parent;
    parentNode.children = parentNode.children.filter(
      (child) => child !== moveNode
    );

    goToMove(parentNode);
    markChanges();
  };
  const updateComment = async (comment: string) => {
    try {
      const fen = getOrientationAwareFen(chess.fen(), orientation);
      setComment(comment);
      await updatePositionComment(fen, comment);
      markChanges();
    } catch (error) {
      showAlert("Error updating comment.", "error");
      console.error("Error updating position comment:", error);
    }
  };

  const getMoveHistoryFromCurrentMove = () => {
    let moveNode = currentMove;
    while (moveNode.parent) {
      moveNode = moveNode.parent;
    }
    return moveNode;
  };

  const saveRepertory = React.useCallback(async () => {
    try {
      setIsSaving(true);
      await putRepertoire(
        repertoireId,
        repertoireName,
        getMoveHistoryFromCurrentMove().getMoveNodeWithoutParent(),
        orientation
      );
      setIsSaving(false);
    } catch (error) {
      showAlert("Error saving repertoire.", "error");
      setIsSaving(false);
    }
  }, [
    repertoireId,
    repertoireName,
    moveHistory,
    orientation,
    showAlert,
    currentMove,
    setIsSaving,
  ]);

  const getPgn = useCallback(async () => {
    const pgn = await toPGN(
      repertoireName,
      new Date(),
      orientation,
      moveHistory
    );
    return pgn;
  }, [repertoireName, orientation, moveHistory]);

  const value: RepertoireContextProps = React.useMemo(
    () => ({
      chess,
      orientation,
      initBoard,
      rotateBoard,
      setChess,
      goToMove,
      changeNameMove,
      deleteMove,
      next,
      nextFollowingVariant,
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
      selectedVariant,
      setSelectedVariant,
    }),
    [
      chess,
      orientation,
      moveHistory,
      repertoireId,
      repertoireName,
      variants,
      comment,
      currentMove,
      updateRepertoire,
      selectedVariant,
    ]
  );

  return (
    <RepertoireContext.Provider value={value}>
      {children}
    </RepertoireContext.Provider>
  );
};
