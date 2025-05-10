import { MoveVariantNode } from "@chess-opening-master/common";

export type Variant = {
  moves: MoveVariantNode[];
  name: string;
  fullName: string;
  differentMoves: string;
};

export type TrainVariant = {
  variant: Variant;
  state: "inProgress" | "discarded" | "finished";
};
