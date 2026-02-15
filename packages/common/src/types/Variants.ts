import { IMoveNode } from "./MoveNode";
import { MoveVariantNode } from "./MoveVariantNode";
import { BoardOrientation } from "./Orientation";

export type ReviewRating = "again" | "hard" | "good" | "easy";

export type SchedulerState = "new" | "learning" | "review";

export type TrainVariantInfo = {
    repertoireId: string;
    variantName: string;
    errors: number;
    lastDate: Date;
    dueAt?: Date;
    lastReviewedAt?: Date;
    lastReviewedDayKey?: string;
    state?: SchedulerState;
    stability?: number;
    difficulty?: number;
    reps?: number;
    lapses?: number;
    intervalDays?: number;
    ease?: number;
    lastRating?: ReviewRating | null;
    suspendedUntil?: Date;
    openingName?: string;
    startingFen?: string;
    orientation?: BoardOrientation;
};

export type VariantReviewInput = {
  variantName: string;
  rating: ReviewRating;
  suggestedRating?: ReviewRating;
  acceptedSuggested?: boolean;
  wrongMoves?: number;
  ignoredWrongMoves?: number;
  hintsUsed?: number;
  timeSpentSec?: number;
  startingFen?: string;
  openingName?: string;
  orientation?: BoardOrientation;
};

export type VariantReviewRecord = VariantReviewInput & {
  repertoireId: string;
  reviewedAt: Date;
  reviewedDayKey: string;
  dueBeforeReviewAt: Date | null;
  nextDueAt: Date;
  schedulerVersion: string;
};

export type Variant = {
  moves: IMoveNode[];
  name: string;
  fullName: string;
  differentMoves: string;
};

export type VariantNode = {
  moves: MoveVariantNode[];
  name: string;
  fullName: string;
  differentMoves: string;
}
