import type { Move } from "chess.js";
import type { Chess } from "chess.js";
import type { ReactNode } from "react";
import type { BoardOrientation, IMoveNode } from "@chess-opening-master/common";
import type { MoveVariantNode } from "../../models/VariantNode";
import type { Variant } from "../../models/chess.models";

export interface RepertoireContextProps {
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

export interface RepertoireContextProviderProps {
  children: ReactNode;
  repertoireId: string;
  repertoireName: string;
  initialOrientation: BoardOrientation;
  initialMoves?: IMoveNode;
  updateRepertoire: () => void;
}
