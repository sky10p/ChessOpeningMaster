import { IMoveNode } from "./MoveNode";

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