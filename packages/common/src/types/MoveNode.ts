import { Move, Square } from "chess.js";

export interface IMoveNode {
  id: string;
  move: Move | null;
  children: IMoveNode[];
  comment?: string;
  variantName?: string;
  circles?: Square[];
  arrows?: Square[][];
}
