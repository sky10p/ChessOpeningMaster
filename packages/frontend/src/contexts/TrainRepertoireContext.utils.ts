import { MoveVariantNode } from "../models/VariantNode";
import { TrainVariant, Variant } from "../models/chess.models";
import { ReviewRating } from "@chess-opening-master/common";
import { suggestReviewRating } from "../utils/chess/spacedRepetition/reviewRating";

export const getDefaultTrainVariants = (
  variants: Variant[],
  variantName?: string,
  variantNames?: Set<string>
): TrainVariant[] => {
  return variants
    .filter((variant) => {
      if (variantNames && variantNames.size > 0) {
        return (
          variantNames.has(variant.fullName) || variantNames.has(variant.name)
        );
      }
      return (
        !variantName ||
        variant.fullName === variantName ||
        variant.name === variantName
      );
    })
    .map((variant) => ({
      variant,
      state: "inProgress",
    }));
};

export const buildVariantStartState = (
  selectedTrainVariants: TrainVariant[],
  nowMs: number,
  startFen: string
): {
  startTimes: Record<string, number>;
  startFens: Record<string, string>;
} => {
  return {
    startTimes: Object.fromEntries(
      selectedTrainVariants.map((trainVariant) => [
        trainVariant.variant.fullName,
        nowMs,
      ])
    ),
    startFens: Object.fromEntries(
      selectedTrainVariants.map((trainVariant) => [
        trainVariant.variant.fullName,
        startFen,
      ])
    ),
  };
};

export const getAllowedMovesFromTrainVariants = (
  trainVariants: TrainVariant[],
  turnNumber: number
): MoveVariantNode[] => {
  const uniqueAllowedMoves = trainVariants
    .filter((trainVariant) => trainVariant.state === "inProgress")
    .map((trainVariant) => trainVariant.variant.moves[turnNumber])
    .reduce((uniqueMoves, move) => {
      if (move) {
        uniqueMoves.add(move);
      }
      return uniqueMoves;
    }, new Set<MoveVariantNode>());

  return [...uniqueAllowedMoves];
};

export const removeVariantFromStartTimes = (
  previousStartTimes: Record<string, number>,
  variantName: string
): Record<string, number> => {
  const nextStartTimes = { ...previousStartTimes };
  delete nextStartTimes[variantName];
  return nextStartTimes;
};

export const removeVariantFromStartFens = (
  previousStartFens: Record<string, string>,
  variantName: string
): Record<string, string> => {
  const nextStartFens = { ...previousStartFens };
  delete nextStartFens[variantName];
  return nextStartFens;
};

export const removePendingReviewByVariantName = <T extends { variantName: string }>(
  previousPendingReviews: T[],
  variantName: string
): T[] => {
  if (previousPendingReviews[0]?.variantName === variantName) {
    return previousPendingReviews.slice(1);
  }
  return previousPendingReviews.filter(
    (pendingReview) => pendingReview.variantName !== variantName
  );
};

export const getOpeningNameFromVariant = (variantName: string): string => {
  const openingName = variantName.split(":")[0]?.trim();
  return openingName || variantName;
};

export const getTotalTrainingErrors = (
  wrongMoves: number,
  ignoredWrongMoves: number
): number => {
  return wrongMoves + ignoredWrongMoves;
};

export const buildPendingVariantReview = (params: {
  variantName: string;
  openingName: string;
  startingFen: string;
  wrongMoves: number;
  ignoredWrongMoves: number;
  hintsUsed: number;
  timeSpentSec: number;
  suggestedRating?: ReviewRating;
}): {
  variantName: string;
  openingName: string;
  startingFen: string;
  wrongMoves: number;
  ignoredWrongMoves: number;
  hintsUsed: number;
  timeSpentSec: number;
  suggestedRating: ReviewRating;
} => {
  const {
    variantName,
    openingName,
    startingFen,
    wrongMoves,
    ignoredWrongMoves,
    hintsUsed,
    timeSpentSec,
    suggestedRating,
  } = params;
  return {
    variantName,
    openingName,
    startingFen,
    wrongMoves,
    ignoredWrongMoves,
    hintsUsed,
    timeSpentSec,
    suggestedRating:
      suggestedRating ??
      suggestReviewRating(
        getTotalTrainingErrors(wrongMoves, ignoredWrongMoves),
        hintsUsed,
        timeSpentSec
      ),
  };
};
