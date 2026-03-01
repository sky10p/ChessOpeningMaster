import { MoveVariantNode } from "../models/VariantNode";
import { TrainVariant, Variant } from "../models/chess.models";
import {
  computeNextMastery as computeSharedNextMastery,
  getOpeningNameFromVariant as getSharedOpeningNameFromVariant,
  getVariantStartPly as getSharedVariantStartPly,
  mergeMistakeSnapshotItems,
  MistakeSnapshotItem,
  ReviewRating,
} from "@chess-opening-master/common";
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

export const getVariantStartPly = (variant: Variant): number =>
  getSharedVariantStartPly(variant);

export const getNormalizedVariantStartPly = (variant: Variant): number =>
  Math.max(0, getVariantStartPly(variant) - 1);

export const getEffectiveReplayStartPly = (
  variant: Variant,
  storedVariantStartPly: number,
  mistakePly: number
): number => {
  const normalizedStored = Math.max(0, Math.floor(storedVariantStartPly));
  const namedStartPly = getVariantStartPly(variant);
  const adjustedStored =
    normalizedStored === namedStartPly
      ? Math.max(0, namedStartPly - 1)
      : normalizedStored;
  const maxBeforeMistake = Math.max(0, Math.floor(mistakePly) - 1);
  if (adjustedStored >= maxBeforeMistake) {
    return 0;
  }
  return Math.max(
    0,
    Math.min(
      Math.max(0, getNormalizedVariantStartPly(variant)),
      Math.min(adjustedStored, maxBeforeMistake)
    )
  );
};

export const getReplayTargetParentPly = (
  expectedMovePly: number,
  replayStartPly: number
): number => {
  const safeExpectedPly = Math.max(1, Math.floor(expectedMovePly));
  const safeReplayStartPly = Math.max(0, Math.floor(replayStartPly));
  return Math.max(safeReplayStartPly, safeExpectedPly - 1);
};

export const resolveExpectedMistakeMoveNode = (
  variant: Variant,
  mistake: {
    mistakePly: number;
    expectedMoveLan: string;
    variantStartPly: number;
  }
): MoveVariantNode | undefined => {
  const normalizedMistakePly = Math.max(1, Math.floor(mistake.mistakePly));
  const expectedMoveLan = mistake.expectedMoveLan.trim();
  const exactMatch = variant.moves.find((moveNode) => {
    const move = moveNode.getMove();
    return (
      moveNode.position === normalizedMistakePly &&
      move?.lan?.trim() === expectedMoveLan
    );
  });
  if (exactMatch) {
    return exactMatch;
  }
  const replayStartPly = getEffectiveReplayStartPly(
    variant,
    mistake.variantStartPly,
    normalizedMistakePly
  );
  const lanMatchAfterStart = variant.moves.find((moveNode) => {
    const move = moveNode.getMove();
    return (
      moveNode.position > replayStartPly && move?.lan?.trim() === expectedMoveLan
    );
  });
  if (lanMatchAfterStart) {
    return lanMatchAfterStart;
  }
  return variant.moves.find(
    (moveNode) => moveNode.position === normalizedMistakePly
  );
};

export const resolveVariantForMistake = (
  variants: Variant[],
  mistake: {
    variantName: string;
    openingName: string;
    expectedMoveLan: string;
    mistakePly: number;
    variantStartPly: number;
  }
): Variant | undefined => {
  const direct = getVariantByName(variants, mistake.variantName);
  if (direct) {
    return direct;
  }
  const openingCandidates = variants.filter((variant) => {
    const openingFromVariant = getOpeningNameFromVariant(variant.fullName);
    return (
      openingFromVariant === mistake.openingName ||
      variant.name === mistake.openingName ||
      variant.fullName === mistake.openingName
    );
  });
  const candidates = openingCandidates.length > 0 ? openingCandidates : variants;
  const expectedLan = mistake.expectedMoveLan.trim();
  const exactCandidate = candidates.find((variant) =>
    variant.moves.some((moveNode) => {
      const move = moveNode.getMove();
      return (
        moveNode.position === Math.max(1, Math.floor(mistake.mistakePly)) &&
        move?.lan?.trim() === expectedLan
      );
    })
  );
  if (exactCandidate) {
    return exactCandidate;
  }
  const lanCandidate = candidates.find((variant) => {
    const resolvedNode = resolveExpectedMistakeMoveNode(variant, {
      mistakePly: mistake.mistakePly,
      expectedMoveLan: mistake.expectedMoveLan,
      variantStartPly: mistake.variantStartPly,
    });
    return resolvedNode?.getMove().lan?.trim() === expectedLan;
  });
  return lanCandidate || candidates[0];
};

export const getStrictProgressIndex = (
  ply: number,
  replayStartPly: number,
  totalSteps: number
): number | null => {
  const index = Math.floor(ply) - Math.floor(replayStartPly) - 1;
  if (!Number.isFinite(index) || index < 0 || index >= totalSteps) {
    return null;
  }
  return index;
};

export const getClampedProgressIndex = (
  ply: number,
  replayStartPly: number,
  totalSteps: number
): number => {
  if (totalSteps <= 0) {
    return 0;
  }
  const index = Math.floor(ply) - Math.floor(replayStartPly) - 1;
  return Math.min(totalSteps - 1, Math.max(0, index));
};

export const getProgressMoveNodes = (
  variant: Variant,
  orientation: "white" | "black",
  startPly: number
): MoveVariantNode[] => {
  const playerColor = orientation === "white" ? "w" : "b";
  return variant.moves
    .filter(
      (moveNode) =>
        moveNode.position > startPly && moveNode.getMove().color === playerColor
    )
    .sort((left, right) => left.position - right.position);
};

export const getFocusTimelineMoves = (
  variant: Variant,
  orientation: "white" | "black"
): MoveVariantNode[] => getProgressMoveNodes(variant, orientation, 0);

export const getProgressIndexByPly = (
  progressMoves: MoveVariantNode[],
  ply: number
): number | null => {
  const targetPly = Math.floor(ply);
  const index = progressMoves.findIndex((moveNode) => moveNode.position === targetPly);
  return index >= 0 ? index : null;
};

export const getFocusIndexByPly = (
  timeline: MoveVariantNode[],
  ply: number
): number | null => getProgressIndexByPly(timeline, ply);

export const getQueueFailedIndicesForVariant = <
  T extends { variantName: string; mistakePly: number }
>(
  queue: T[],
  variantName: string,
  timeline: MoveVariantNode[]
): number[] =>
  queue
    .filter((item) => item.variantName === variantName)
    .map((item) => getFocusIndexByPly(timeline, item.mistakePly))
    .filter((value): value is number => value !== null);

export const getCompletedProgressCount = (
  progressMoves: MoveVariantNode[],
  currentPosition: number
): number =>
  progressMoves.filter((moveNode) => moveNode.position <= currentPosition).length;

export const getFocusCompletedCountByPosition = (
  timeline: MoveVariantNode[],
  currentPosition: number
): number => getCompletedProgressCount(timeline, currentPosition);

export const getActiveProgressIndex = (
  progressMoves: MoveVariantNode[],
  currentPosition: number
): number => {
  if (progressMoves.length === 0) {
    return 0;
  }
  const nextIndex = progressMoves.findIndex(
    (moveNode) => moveNode.position > currentPosition
  );
  if (nextIndex >= 0) {
    return nextIndex;
  }
  return progressMoves.length - 1;
};

export const getFocusActiveIndexByPosition = (
  timeline: MoveVariantNode[],
  currentPosition: number
): number => getActiveProgressIndex(timeline, currentPosition);

export const getRemainingVariantMoves = (
  variant: Variant,
  fromPly: number
): MoveVariantNode[] =>
  variant.moves
    .filter((moveNode) => moveNode.position > Math.floor(fromPly))
    .sort((left, right) => left.position - right.position);

export const shouldAutoCompleteSingleVariantMistakeSession = (params: {
  mode: "standard" | "mistakes";
  source: "review" | "mistakeOnly";
  trainVariantsCount: number;
}): boolean =>
  params.mode === "mistakes" &&
  params.source === "mistakeOnly" &&
  params.trainVariantsCount === 1;

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
    const variantStartPly = getNormalizedVariantStartPly(trainVariant.variant);
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

export const getOpeningNameFromVariant = (variantName: string): string =>
  getSharedOpeningNameFromVariant(variantName);

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

export const parseMistakeKey = (
  mistakeKey: string
):
  | {
      variantName: string;
      mistakePly: number;
      expectedMoveLan: string;
      variantStartPly: number;
    }
  | null => {
  const lastSeparator = mistakeKey.lastIndexOf("::");
  if (lastSeparator <= 0) {
    return null;
  }
  const secondLastSeparator = mistakeKey.lastIndexOf("::", lastSeparator - 1);
  if (secondLastSeparator <= 0) {
    return null;
  }
  const thirdLastSeparator = mistakeKey.lastIndexOf("::", secondLastSeparator - 1);
  if (thirdLastSeparator <= 0) {
    return null;
  }
  const variantName = mistakeKey.slice(0, thirdLastSeparator).trim();
  const mistakePly = Number(
    mistakeKey.slice(thirdLastSeparator + 2, secondLastSeparator)
  );
  const expectedMoveLan = mistakeKey
    .slice(secondLastSeparator + 2, lastSeparator)
    .trim();
  const variantStartPly = Number(mistakeKey.slice(lastSeparator + 2));
  if (
    !variantName ||
    !expectedMoveLan ||
    !Number.isFinite(mistakePly) ||
    !Number.isFinite(variantStartPly)
  ) {
    return null;
  }
  return {
    variantName,
    mistakePly: Math.max(1, Math.floor(mistakePly)),
    expectedMoveLan,
    variantStartPly: Math.max(0, Math.floor(variantStartPly)),
  };
};

export const mergeMistakesByKey = (
  existing: MistakeSnapshotItem[],
  incoming: MistakeSnapshotItem[]
): MistakeSnapshotItem[] => mergeMistakeSnapshotItems(existing, incoming);

export const sortMistakeQueueItems = <
  T extends { variantName: string; mistakePly: number; mistakeKey: string }
>(
  items: T[]
): T[] =>
  [...items].sort((left, right) => {
    if (left.variantName !== right.variantName) {
      return left.variantName.localeCompare(right.variantName);
    }
    if (left.mistakePly !== right.mistakePly) {
      return left.mistakePly - right.mistakePly;
    }
    return left.mistakeKey.localeCompare(right.mistakeKey);
  });

export const computeNextMastery = (params: {
  previousMastery: number;
  rating: ReviewRating;
  wrongMoves: number;
  ignoredWrongMoves: number;
  hintsUsed: number;
}): number => computeSharedNextMastery(params);

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
