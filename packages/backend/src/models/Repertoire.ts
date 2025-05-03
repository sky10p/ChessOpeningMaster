export interface Move {
  color: string;
  piece: string;
  from: string;
  to: string;
  san: string;
  flags: string;
  lan: string;
  before: string;
  after: string;
}

export interface MoveNode {
  id: string;
  move: Move | null;
  comment?: string;
  children?: MoveNode[];
  variantName?: string;
  circles?: string[];
  arrows?: string[][];
}

export interface Repertoire {
  _id: { $oid: string };
  name: string;
  moveNodes: MoveNode;
  orientation: "white" | "black";
  order: number;
}
