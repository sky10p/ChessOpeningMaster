import { ReviewRating } from "@chess-opening-master/common";

export const suggestReviewRating = (
  wrongMoves: number,
  hintsUsed: number,
  timeSpentSec: number
): ReviewRating => {
  if (wrongMoves >= 3) {
    return "again";
  }
  if (wrongMoves >= 2 || hintsUsed >= 2) {
    return "hard";
  }
  if (wrongMoves === 0 && hintsUsed === 0 && timeSpentSec > 0 && timeSpentSec <= 45) {
    return "easy";
  }
  return "good";
};
