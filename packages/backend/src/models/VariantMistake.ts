import {
  BoardOrientation,
  ReviewRating,
  SchedulerState,
} from "@chess-opening-master/common";

export interface VariantMistake {
  userId: string;
  repertoireId: string;
  variantName: string;
  openingName: string;
  orientation?: BoardOrientation;
  mistakeKey: string;
  positionFen: string;
  variantStartFen: string;
  variantStartPly: number;
  mistakePly: number;
  expectedMoveLan: string;
  expectedMoveSan?: string;
  seenCount: number;
  solvedCount: number;
  dueAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date;
}
