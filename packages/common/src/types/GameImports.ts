import { BoardOrientation } from "./Orientation";

export type GameSource = "lichess" | "chesscom" | "manual";

export type LinkedAccountProvider = "lichess" | "chesscom";

export type SyncStatus = "idle" | "running" | "failed" | "completed";

export interface LinkedGameAccount {
  id: string;
  provider: LinkedAccountProvider;
  username: string;
  connectedAt: string;
  lastSyncAt?: string;
  status: SyncStatus;
  lastError?: string;
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
  rated?: boolean;
  playedAt?: string;
  pgn: string;
  movesSan: string[];
  orientation?: BoardOrientation;
  tournamentGroup?: string;
  tags?: string[];
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
  confidence: number;
  strategy: "eco" | "movePrefix" | "fuzzyName" | "tagOverlap" | "manual" | "none";
  requiresManualReview: boolean;
}

export interface ImportSummary {
  importedCount: number;
  duplicateCount: number;
  failedCount: number;
  statsRefreshedAt: string;
}

export interface GameStatsFilters {
  dateFrom?: string;
  dateTo?: string;
  timeControlBucket?: "bullet" | "blitz" | "rapid" | "classical";
  ratedOnly?: boolean;
  color?: BoardOrientation;
  opponentRatingBand?: string;
  tournamentGroup?: string;
}

export interface LineStudyCandidate {
  lineKey: string;
  eco?: string;
  openingName: string;
  movesSan: string[];
  sampleGameIds: string[];
  games: number;
  wins: number;
  draws: number;
  losses: number;
  deviationRate: number;
  underperformanceScore: number;
  recencyScore: number;
  frequencyScore: number;
  suggestedTasks: string[];
}

export interface GamesStatsSummary {
  totalGames: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number;
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
  movesSan: string[];
  priority: number;
  reasons: string[];
  effort: "low" | "medium" | "high";
  tasks: string[];
  done: boolean;
}

export interface TrainingPlan {
  id: string;
  generatedAt: string;
  weights: TrainingPlanWeights;
  items: TrainingPlanItem[];
}
