import { ReviewRating } from "@chess-opening-master/common";

const normalizeNonNegativeInt = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.floor(value));
};

export const suggestReviewRating = (
  wrongMoves: number,
  hintsUsed: number,
  timeSpentSec: number
): ReviewRating => {
  const normalizedWrongMoves = normalizeNonNegativeInt(wrongMoves);
  const normalizedHintsUsed = normalizeNonNegativeInt(hintsUsed);
  const normalizedTimeSpentSec = normalizeNonNegativeInt(timeSpentSec);

  if (normalizedWrongMoves >= 3) {
    return "again";
  }
  if (normalizedWrongMoves >= 2 || normalizedHintsUsed >= 2) {
    return "hard";
  }
  if (
    normalizedWrongMoves === 0 &&
    normalizedHintsUsed === 0 &&
    normalizedTimeSpentSec > 0 &&
    normalizedTimeSpentSec <= 45
  ) {
    return "easy";
  }
  return "good";
};
