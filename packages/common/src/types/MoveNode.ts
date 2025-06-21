import { Move, Square } from "chess.js";

export interface IMoveNode {
  id: string;
  move: Move | null;
  children: IMoveNode[];
  variantName?: string;
  circles?: Square[];
  arrows?: Square[][];
}
