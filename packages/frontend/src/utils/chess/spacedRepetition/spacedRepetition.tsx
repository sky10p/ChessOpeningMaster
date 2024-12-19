import { TrainVariant, TrainVariantInfo } from "../../../models/chess.models";
import { getTrainVariantInfo } from "../../../repository/repertoires/trainVariants";

const SPACED_REPETITION_CONFIG = {
  NEW_VARIANTS_RATIO: 0.3,
  BASE_INTERVAL_DAYS: 3,
  ERROR_FACTOR: 0.5
};

export const getSpacedRepetitionVariants = async (
  count: number,
  repertoireId: string,
  variants: TrainVariant[]
): Promise<TrainVariant[]> => {

  const variantsInfo = await getTrainVariantInfo(repertoireId);
  const infoMap = new Map<string, TrainVariantInfo>(
    variantsInfo.map(info => [info.variantName, info])
  );

  const newVariants: TrainVariant[] = [];
  const reviewedVariants: { variant: TrainVariant; score: number }[] = [];

  const now = Date.now();
  const {
    NEW_VARIANTS_RATIO,
    BASE_INTERVAL_DAYS,
    ERROR_FACTOR
  } = SPACED_REPETITION_CONFIG;

  for (const variant of variants) {
    const name = variant.variant.fullName;
    const info = infoMap.get(name);

    if (!info) {
      newVariants.push(variant);
    } else {
      const errors = info.errors ?? 0;
      const lastDate = info.lastDate;
      const daysSinceLastReview = (now - lastDate.getTime()) / (1000 * 60 * 60 * 24);

      const difficulty = 1 + (errors * ERROR_FACTOR);
      const expectedInterval = BASE_INTERVAL_DAYS * difficulty;

      let score: number;
      if (daysSinceLastReview < expectedInterval) {
        score = daysSinceLastReview / expectedInterval;
      } else {
        score = (daysSinceLastReview / expectedInterval);
      }

      reviewedVariants.push({ variant, score });
    }
  }

  reviewedVariants.sort((a, b) => b.score - a.score);

  const newCount = Math.round(count * NEW_VARIANTS_RATIO);
  const reviewedCount = count - newCount;

  const chosenNewVariants = newVariants.slice(0, newCount);
  const chosenReviewedVariants = reviewedVariants.slice(0, reviewedCount).map(v => v.variant);

  const finalSelection = [...chosenNewVariants, ...chosenReviewedVariants];

  if (finalSelection.length < count) {
    const remainingNeeded = count - finalSelection.length;
    const chosenNewCount = chosenNewVariants.length;
    const chosenReviewedCount = chosenReviewedVariants.length;
    
    const remainingNew = newVariants.slice(chosenNewCount, chosenNewCount + remainingNeeded);
    const remainingReviewed = reviewedVariants
      .slice(chosenReviewedCount, chosenReviewedCount + remainingNeeded)
      .map(v => v.variant);

    let stillNeeded = remainingNeeded;
    if (remainingReviewed.length > 0) {
      const toAddReviewed = remainingReviewed.slice(0, stillNeeded);
      finalSelection.push(...toAddReviewed);
      stillNeeded -= toAddReviewed.length;
    }

    if (stillNeeded > 0 && remainingNew.length > 0) {
      const toAddNew = remainingNew.slice(0, stillNeeded);
      finalSelection.push(...toAddNew);
      stillNeeded -= toAddNew.length;
    }
  }

  return finalSelection;
};
