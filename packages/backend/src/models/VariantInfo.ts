import { VariantState } from "@chess-opening-master/common";

export interface VariantInfo {
  _id: { $oid: string };
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
}

export const DEFAULT_EASE_FACTOR = 2.5;
export const MIN_EASE_FACTOR = 1.3;
export const DEFAULT_INTERVAL = 1;
export const DEFAULT_REPETITIONS = 0;
export const DEFAULT_LAPSES = 0;
