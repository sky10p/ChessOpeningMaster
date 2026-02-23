import {
  MistakeSnapshotItem,
  ReviewRating,
  SchedulerState,
} from "@chess-opening-master/common";
import { BoardOrientation } from "@chess-opening-master/common";

export interface VariantInfo {
  _id: { $oid: string };
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
  dailyErrorsDayKey?: string;
  dailyErrorSnapshot?: MistakeSnapshotItem[];
  dailyErrorCount?: number;
  masteryScore?: number;
  perfectRunStreak?: number;
  masteryUpdatedAt?: Date;
}
