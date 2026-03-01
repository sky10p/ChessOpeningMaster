import { TrainVariantInfo } from "@chess-opening-master/common";
import { TrainVariant } from "../../../models/chess.models";
import { VariantsProgressCounts, VariantsProgressInfo } from "./models";

export type VariantInfoKeyResolver = (variant: TrainVariant) => string;

const defaultVariantInfoKeyResolver: VariantInfoKeyResolver = (variant) =>
  variant.variant.fullName;

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
  variantInfo: Record<string, TrainVariantInfo>,
  variantInfoKeyResolver: VariantInfoKeyResolver = defaultVariantInfoKeyResolver
) => {
  const info = variantInfo[variantInfoKeyResolver(variant)];
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
  variantInfo: Record<string, TrainVariantInfo>,
  variantInfoKeyResolver: VariantInfoKeyResolver = defaultVariantInfoKeyResolver
): string | undefined => {
  const color = getColor(variant, variantInfo, variantInfoKeyResolver);
  if (color === VARIANT_COLORS.unresolved) {
    return undefined;
  }
  return color;
};

export const getVariantsProgressInfo = (
  variants: TrainVariant[],
  variantInfo: Record<string, TrainVariantInfo>,
  variantInfoKeyResolver: VariantInfoKeyResolver = defaultVariantInfoKeyResolver
): VariantsProgressInfo => {
  const totalVariants = variants.length;
  const counts: VariantsProgressCounts = {
    noErrors: 0,
    oneError: 0,
    twoErrors: 0,
    moreThanTwoErrors: 0,
    unresolved: 0,
  };

  let hasErrors = false;
  let hasNewVariants = false;

  variants.forEach((variant) => {
    const info = variantInfo[variantInfoKeyResolver(variant)];
    if (info === undefined) {
      counts.unresolved++;
    } else if (info.errors === 0) {
      counts.noErrors++;
    } else if (info.errors === 1) {
      counts.oneError++;
      hasErrors = true;
    } else if (info.errors === 2) {
      counts.twoErrors++;
      hasErrors = true;
    } else {
      counts.moreThanTwoErrors++;
      hasErrors = true;
    }
  });
  hasNewVariants = counts.unresolved > 0;

  return {
    totalVariants,
    hasErrors,
    hasNewVariants,
    counts,
  };
};
