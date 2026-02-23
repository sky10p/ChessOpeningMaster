import { MoveVariantNode } from "../models/VariantNode";
import { TrainVariant, Variant } from "../models/chess.models";
import { MistakeSnapshotItem, ReviewRating } from "@chess-opening-master/common";
import { suggestReviewRating } from "../utils/chess/spacedRepetition/reviewRating";
import { Chess } from "chess.js";

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

export const getVariantStartPly = (variant: Variant): number => {
  let startPly = 0;
  variant.moves.forEach((moveNode) => {
    if (
      moveNode.variantName &&
      (moveNode.variantName === variant.name ||
        moveNode.variantName === variant.fullName)
    ) {
      startPly = moveNode.position;
    }
  });
  return Math.max(0, startPly);
};

export const getVariantFenAtPly = (variant: Variant, targetPly: number): string => {
  const chess = new Chess();
  variant.moves.forEach((moveNode) => {
    if (moveNode.position <= targetPly) {
      chess.move(moveNode.getMove());
    }
  });
  return chess.fen();
};

export const buildVariantStartStateByVariant = (
  selectedTrainVariants: TrainVariant[],
  nowMs: number
): {
  startTimes: Record<string, number>;
  startFens: Record<string, string>;
  startPlys: Record<string, number>;
} => {
  const startTimes: Record<string, number> = {};
  const startFens: Record<string, string> = {};
  const startPlys: Record<string, number> = {};
  selectedTrainVariants.forEach((trainVariant) => {
    const variantName = trainVariant.variant.fullName;
    const variantStartPly = getVariantStartPly(trainVariant.variant);
    startTimes[variantName] = nowMs;
    startPlys[variantName] = variantStartPly;
    startFens[variantName] = getVariantFenAtPly(trainVariant.variant, variantStartPly);
  });
  return { startTimes, startFens, startPlys };
};

export const getAllowedMovesFromTrainVariants = (
  trainVariants: TrainVariant[],
  turnNumber: number
): MoveVariantNode[] => {
  const uniqueAllowedMoves = trainVariants
    .filter((trainVariant) => trainVariant.state === "inProgress")
    .map((trainVariant) => {
      const expectedPosition = turnNumber + 1;
      return (
        trainVariant.variant.moves.find(
          (moveNode) => moveNode.position === expectedPosition
        ) || trainVariant.variant.moves[turnNumber]
      );
    })
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

export const buildMistakeKey = (
  variantName: string,
  mistakePly: number,
  expectedMoveLan: string,
  variantStartPly: number
): string =>
  `${variantName}::${Math.max(1, Math.floor(mistakePly))}::${expectedMoveLan.trim()}::${Math.max(
    0,
    Math.floor(variantStartPly)
  )}`;

export const mergeMistakesByKey = (
  existing: MistakeSnapshotItem[],
  incoming: MistakeSnapshotItem[]
): MistakeSnapshotItem[] => {
  const map = new Map<string, MistakeSnapshotItem>();
  existing.forEach((item) => map.set(item.mistakeKey, item));
  incoming.forEach((item) => map.set(item.mistakeKey, item));
  return Array.from(map.values());
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const computeNextMastery = (params: {
  previousMastery: number;
  rating: ReviewRating;
  wrongMoves: number;
  ignoredWrongMoves: number;
  hintsUsed: number;
}): number => {
  const ratingBonusMap: Record<ReviewRating, number> = {
    again: -12,
    hard: -4,
    good: 4,
    easy: 10,
  };
  const sessionScore = Math.max(
    0,
    100 -
      22 * Math.max(0, Math.floor(params.wrongMoves)) -
      8 * Math.max(0, Math.floor(params.ignoredWrongMoves)) -
      6 * Math.max(0, Math.floor(params.hintsUsed))
  );
  const perfectRun =
    params.wrongMoves === 0 &&
    params.ignoredWrongMoves === 0 &&
    params.hintsUsed === 0;
  const perfectBonus = perfectRun ? 8 : 0;
  return clamp(
    Math.round(
      0.75 * params.previousMastery +
        0.25 * sessionScore +
        ratingBonusMap[params.rating] +
        perfectBonus
    ),
    0,
    100
  );
};

export const getVariantByName = (
  variants: Variant[],
  variantName: string
): Variant | undefined =>
  variants.find(
    (variant) =>
      variant.fullName === variantName || variant.name === variantName
  );

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
