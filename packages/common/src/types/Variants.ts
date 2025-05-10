import { IMoveNode } from "./MoveNode";
import { MoveVariantNode } from "./MoveVariantNode";

export type TrainVariantInfo = {
    repertoireId: string;
    variantName: string;
    errors: number;
    lastDate: Date;
};

export type Variant = {
  moves: IMoveNode[];
  name: string;
  fullName: string;
  differentMoves: string;
};

export type VariantNode = {
  moves: MoveVariantNode[];
  name: string;
  fullName: string;
  differentMoves: string;
}