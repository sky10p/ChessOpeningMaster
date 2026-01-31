import { IMoveNode } from "./MoveNode";
import { MoveVariantNode } from "./MoveVariantNode";

export type ResponseQuality = 0 | 1 | 2 | 3 | 4 | 5;

export type VariantState = "new" | "learning" | "review" | "relearning";

export type TrainVariantInfo = {
    repertoireId: string;
    variantName: string;
    errors: number;
    lastDate: Date;
    easeFactor?: number;
    interval?: number;
    repetitions?: number;
    state?: VariantState;
    dueDate?: Date;
    lapses?: number;
    responseQuality?: ResponseQuality;
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