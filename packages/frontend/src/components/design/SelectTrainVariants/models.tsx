import { TrainVariant } from "../../../models/chess.models";

export interface GroupedVariant extends TrainVariant {
  originalIndex: number;
}

export interface TrainVariantInfo {
  errors: number;
}
