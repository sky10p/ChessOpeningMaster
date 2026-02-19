import { GameStatsFilters, GamesStatsSummary, ImportSummary, ImportedGame, LinkedGameAccount, TrainingPlan, TrainingPlanWeights } from "@chess-opening-master/common";
import type { ImportedGamesFilters } from "./gameImportFilters";
import { runAutoSyncForDueAccountsInternal } from "./autoSyncService";
import { importGamesForUserInternal, ProviderImportInput } from "./gameImportOrchestratorService";
import { getGamesStatsSummaryForUser } from "./gameStatsAggregationService";
import { clearImportedGamesForUser, deleteImportedGameForUser, listImportedGamesForUser } from "./importedGamesService";
import { disconnectLinkedAccountForUser, listLinkedAccountsForUser, upsertLinkedAccountForUser } from "./linkedAccountsService";
import { generateTrainingPlanForUser, getLatestTrainingPlanForUser, markTrainingPlanItemDoneForUser } from "./trainingPlanService";

export type { ImportedGamesFilters } from "./gameImportFilters";

export async function listLinkedAccounts(userId: string): Promise<LinkedGameAccount[]> {
  return listLinkedAccountsForUser(userId);
}

export async function upsertLinkedAccount(userId: string, provider: "lichess" | "chesscom", username: string, token?: string): Promise<LinkedGameAccount> {
  return upsertLinkedAccountForUser(userId, provider, username, token);
}

export async function disconnectLinkedAccount(userId: string, provider: "lichess" | "chesscom"): Promise<void> {
  return disconnectLinkedAccountForUser(userId, provider);
}

export async function importGamesForUser(userId: string, input: ProviderImportInput): Promise<ImportSummary> {
  return importGamesForUserInternal(userId, input);
}

export async function listImportedGames(userId: string, limit = 100, filters: ImportedGamesFilters = {}): Promise<ImportedGame[]> {
  return listImportedGamesForUser(userId, limit, filters);
}

export async function deleteImportedGame(userId: string, gameId: string): Promise<boolean> {
  return deleteImportedGameForUser(userId, gameId);
}

export async function clearImportedGames(userId: string, filters: ImportedGamesFilters = {}): Promise<number> {
  return clearImportedGamesForUser(userId, filters);
}

export async function getGamesStats(userId: string, filters: GameStatsFilters): Promise<GamesStatsSummary> {
  return getGamesStatsSummaryForUser(userId, filters);
}

export async function generateTrainingPlan(
  userId: string,
  weights?: Partial<TrainingPlanWeights>,
  filters?: ImportedGamesFilters
): Promise<TrainingPlan> {
  return generateTrainingPlanForUser(userId, weights, filters);
}

export async function getLatestTrainingPlan(userId: string, filters?: ImportedGamesFilters): Promise<TrainingPlan | null> {
  return getLatestTrainingPlanForUser(userId, filters);
}

export async function markTrainingPlanItemDone(userId: string, planId: string, lineKey: string, done: boolean): Promise<void> {
  return markTrainingPlanItemDoneForUser(userId, planId, lineKey, done);
}

export async function runAutoSyncForDueAccounts(maxAccounts = 25): Promise<void> {
  return runAutoSyncForDueAccountsInternal(importGamesForUser, maxAccounts);
}
