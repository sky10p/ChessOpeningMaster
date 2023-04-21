import { MoveVariantNode } from "../utils/VariantNode";

export type Variant = {moves: MoveVariantNode[], name: string};

export type TrainVariant = {
    variant: Variant;
    state: "inProgress" | "discarded" | "finished";
  }