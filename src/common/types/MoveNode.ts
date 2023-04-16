import { Move } from "chess.js";

export interface IMoveNode {
  id: string;
  move: Move | null;
  children: IMoveNode[];
  comment?: string;
  variantName?: string;
}
