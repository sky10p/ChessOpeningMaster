import { ReviewRating } from "@chess-opening-master/common";

export interface VariantReviewHistory {
  userId: string;
  repertoireId: string;
  variantName: string;
  isFirstReview: boolean;
  reviewedAt: Date;
  reviewedDayKey: string;
  rating: ReviewRating;
  suggestedRating?: ReviewRating;
  acceptedSuggested: boolean;
  wrongMoves: number;
  ignoredWrongMoves: number;
  hintsUsed: number;
  timeSpentSec: number;
  startingFen?: string;
  openingName?: string;
  orientation?: "white" | "black";
  dueBeforeReviewAt: Date | null;
  nextDueAt: Date;
  schedulerVersion: string;
}
