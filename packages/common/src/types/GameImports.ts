import { BoardOrientation } from "./Orientation";

export type GameSource = "lichess" | "chesscom" | "manual";

export type LinkedAccountProvider = "lichess" | "chesscom";

export type SyncStatus = "idle" | "running" | "failed" | "completed";

export type GameTimeControlBucket = "bullet" | "blitz" | "rapid" | "classical";

export interface AccountSyncFeedback {
  source: LinkedAccountProvider;
  importedCount: number;
  duplicateCount: number;
  failedCount: number;
  processedCount: number;
  startedAt: string;
  finishedAt: string;
}

export interface LinkedGameAccount {
  id: string;
  provider: LinkedAccountProvider;
  username: string;
  connectedAt: string;
  lastSyncAt?: string;
  nextSyncAt?: string;
  status: SyncStatus;
  lastError?: string;
  lastSyncStartedAt?: string;
  lastSyncFinishedAt?: string;
  lastSyncFeedback?: AccountSyncFeedback;
}

export interface ImportedGame {
  id: string;
  source: GameSource;
  providerGameId?: string;
  white: string;
  black: string;
  whiteRating?: number;
  blackRating?: number;
  result: "1-0" | "0-1" | "1/2-1/2" | "*";
  timeControl?: string;
  timeControlBucket?: GameTimeControlBucket;
  rated?: boolean;
  playedAt?: string;
  pgn: string;
  movesSan: string[];
  orientation?: BoardOrientation;
  tournamentGroup?: string;
  tags?: string[];
  openingDetection: OpeningDetection;
  openingMapping: OpeningMapping;
}

export interface OpeningDetection {
  eco?: string;
  openingName?: string;
  lineMovesSan: string[];
  lineKey: string;
  confidence: number;
  fallbackSignature?: string;
}

export interface OpeningMapping {
  repertoireId?: string;
  repertoireName?: string;
  variantName?: string;
  confidence: number;
  strategy: "eco" | "movePrefix" | "fuzzyName" | "tagOverlap" | "manual" | "none";
  requiresManualReview: boolean;
}

export interface ImportSummary {
  source: GameSource;
  importedCount: number;
  duplicateCount: number;
  failedCount: number;
  processedCount: number;
  statsRefreshedAt: string;
}

export interface GameStatsFilters {
  dateFrom?: string;
  dateTo?: string;
  timeControlBucket?: GameTimeControlBucket;
  ratedOnly?: boolean;
  color?: BoardOrientation;
  source?: GameSource;
  openingQuery?: string;
  mapped?: "mapped" | "unmapped" | "all";
  opponentRatingBand?: string;
  tournamentGroup?: string;
}

export interface LineStudyCandidate {
  lineKey: string;
  eco?: string;
  openingName: string;
  variantName?: string;
  movesSan: string[];
  sampleGameIds: string[];
  repertoireName?: string;
  games: number;
  mappedGames: number;
  manualReviewGames: number;
  averageMappingConfidence: number;
  repertoireGapScore: number;
  wins: number;
  draws: number;
  losses: number;
  deviationRate: number;
  underperformanceScore: number;
  recencyScore: number;
  frequencyScore: number;
  trainingErrors?: number;
  trainingDueAt?: string;
  trainingLastReviewedAt?: string;
  suggestedTasks: string[];
}

export interface GamesStatsSummary {
  totalGames: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number;
  bySource: Array<{ source: GameSource; count: number }>;
  mappedToRepertoireCount: number;
  needsManualReviewCount: number;
  uniqueLines: number;
  openingPerformance: Array<{
    openingName: string;
    games: number;
    wins: number;
    draws: number;
    losses: number;
    mappedGames: number;
    manualReviewGames: number;
    successRate: number;
  }>;
  variantPerformance: Array<{
    variantKey: string;
    variantName: string;
    repertoireId?: string;
    repertoireName?: string;
    games: number;
    wins: number;
    draws: number;
    losses: number;
    mappedGames: number;
    manualReviewGames: number;
    averageMappingConfidence?: number;
    successRate: number;
  }>;
  gamesByMonth: Array<{
    month: string;
    games: number;
    wins: number;
    draws: number;
    losses: number;
  }>;
  unmappedOpenings: Array<{
    openingName: string;
    games: number;
    manualReviewGames: number;
    mappedGames: number;
    successRate: number;
    sampleLine: string[];
  }>;
  unusedRepertoires: Array<{
    repertoireId: string;
    repertoireName: string;
    mappedGames: number;
  }>;
  topOpenings: Array<{ openingName: string; count: number }>;
  linesToStudy: LineStudyCandidate[];
}

export interface TrainingPlanWeights {
  frequency: number;
  problem: number;
  recency: number;
  repertoireGap: number;
  deviationRate: number;
}

export interface TrainingPlanItem {
  lineKey: string;
  openingName: string;
  variantName?: string;
  repertoireName?: string;
  movesSan: string[];
  priority: number;
  reasons: string[];
  effort: "low" | "medium" | "high";
  tasks: string[];
  games: number;
  wins: number;
  draws: number;
  losses: number;
  mappedGames: number;
  manualReviewGames: number;
  deviationRate: number;
  averageMappingConfidence?: number;
  repertoireGapScore?: number;
  underperformanceScore?: number;
  recencyScore?: number;
  frequencyScore?: number;
  trainingErrors?: number;
  trainingDueAt?: string;
  trainingLastReviewedAt?: string;
  done: boolean;
}

export interface TrainingPlan {
  id: string;
  generatedAt: string;
  weights: TrainingPlanWeights;
  items: TrainingPlanItem[];
}
