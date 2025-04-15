import { TrainVariantInfo } from "packages/common/build/common";
import { TrainVariant } from "../models/chess.models";


interface VariantsProgressCounts {
  noErrors: number;
  oneError: number;
  twoErrors: number;
  moreThanTwoErrors: number;
  unresolved: number;
}

interface VariantsProgressInfo {
  totalVariants: number;
  hasErrors: boolean;
  hasNewVariants: boolean;
  counts: VariantsProgressCounts;
}

export const useVariantsProgressInfo = (
  variants: TrainVariant[],
  variantInfo: Record<string, TrainVariantInfo>
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
    const info = variantInfo[variant.variant.fullName];
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

  
