import { TrainVariantInfo } from "@chess-opening-master/common";
import { TrainVariant } from "../../../models/chess.models";

export const VARIANT_COLORS = {
  noErrors: "#4CAF50", // Green
  oneError: "#FFEB3B", // Yellow
  twoErrors: "#FF9800", // Orange
  moreThanTwoErrors: "#F44336", // Red
  unresolved: "#9E9E9E", // Gray
};

export const VARIANT_TEXT_COLORS = {
  noErrors: "#FFFFFF", // White
  oneError: "#000000", // Black
  twoErrors: "#000000", // Black
  moreThanTwoErrors: "#FFFFFF", // White
  unresolved: "#FFFFFF", // White
};

export const getColor = (
  variant: TrainVariant,
  variantInfo: Record<string, TrainVariantInfo>
) => {
  const info = variantInfo[variant.variant.fullName];
  if (info === undefined) {
    return VARIANT_COLORS.unresolved;
  }
  if (info.errors === 0) {
    return VARIANT_COLORS.noErrors;
  }
  if (info.errors === 1) {
    return VARIANT_COLORS.oneError;
  }
  if (info.errors === 2) {
    return VARIANT_COLORS.twoErrors;
  }
  return VARIANT_COLORS.moreThanTwoErrors;
};

export const getTextColor = (
  variant: TrainVariant,
  variantInfo: Record<string, TrainVariantInfo>
) => {
  const color = getColor(variant, variantInfo);
  if (color === VARIANT_COLORS.unresolved) {
    return VARIANT_TEXT_COLORS.unresolved;
  }
  return color;
};
