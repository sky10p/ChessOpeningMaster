import { ObjectId } from "mongodb";
import { AccountSyncFeedback, BoardOrientation, GameSource, GameTimeControlBucket, LinkedAccountProvider, OpeningDetection, OpeningMapping, SyncStatus, TrainingPlan, TrainingPlanWeights } from "@chess-opening-master/common";

export interface LinkedGameAccountDocument {
  userId: string;
  provider: LinkedAccountProvider;
  username: string;
  tokenEncrypted?: string;
  connectedAt: Date;
  lastSyncAt?: Date;
  status: SyncStatus;
  lastError?: string;
  lastSyncStartedAt?: Date;
  lastSyncFinishedAt?: Date;
  lastSyncFeedback?: AccountSyncFeedback;
}

export interface ImportedGameDocument {
  _id?: ObjectId;
  userId: string;
  source: GameSource;
  providerGameId?: string;
  dedupeKey: string;
  white: string;
  black: string;
  whiteRating?: number;
  blackRating?: number;
  result: "1-0" | "0-1" | "1/2-1/2" | "*";
  timeControl?: string;
  timeControlBucket?: GameTimeControlBucket;
  rated?: boolean;
  playedAt?: Date;
  pgn: string;
  movesSan: string[];
  orientation?: BoardOrientation;
  tournamentGroup?: string;
  tags?: string[];
  openingDetection: OpeningDetection;
  openingMapping: OpeningMapping;
  createdAt: Date;
}

export interface TrainingPlanDocument extends TrainingPlan {
  userId: string;
  generatedAtDate: Date;
}

export const DEFAULT_TRAINING_PLAN_WEIGHTS: TrainingPlanWeights = {
  frequency: 0.25,
  problem: 0.3,
  recency: 0.15,
  repertoireGap: 0.2,
  deviationRate: 0.1,
};
