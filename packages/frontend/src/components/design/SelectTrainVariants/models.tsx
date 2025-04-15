import { TrainVariant } from "../../../models/chess.models";

export interface GroupedVariant extends TrainVariant {
  originalIndex: number;
}

export interface VariantsProgressCounts {
  noErrors: number;
  oneError: number;
  twoErrors: number;
  moreThanTwoErrors: number;
  unresolved: number;
}

export interface VariantsProgressInfo {
  totalVariants: number;
  hasErrors: boolean;
  hasNewVariants: boolean;
  counts: VariantsProgressCounts;
}