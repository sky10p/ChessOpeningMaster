import { MoveVariantNode } from "./VariantNode";

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

export type TrainVariantInfo = {
  repertoireId: string;
  variantName: string;
  errors: number;
};
