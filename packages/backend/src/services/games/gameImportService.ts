import { GameStatsFilters, GamesStatsSummary, ImportSummary, ImportedGame, LinkedGameAccount, TrainingPlan, TrainingPlanWeights } from "@chess-opening-master/common";
import type { ImportedGamesFilters } from "./gameImportFilters";
import { runAutoSyncForDueAccountsInternal } from "./autoSyncService";
import { importGamesForUserInternal, ProviderImportInput } from "./gameImportOrchestratorService";
import { getGamesStatsSummaryForUser } from "./gameStatsAggregationService";
import { clearImportedGamesForUser, deleteImportedGameForUser, listImportedGamesForUser, rematchImportedGamesForUser } from "./importedGamesService";
import { disconnectLinkedAccountForUser, listLinkedAccountsForUser, upsertLinkedAccountForUser } from "./linkedAccountsService";
import { generateTrainingPlanForUser, getLatestTrainingPlanForUser, markTrainingPlanItemDoneForUser } from "./trainingPlanService";

export type { ImportedGamesFilters } from "./gameImportFilters";

export type ForceSyncOptions = {
  forceProviderSync?: boolean;
  rematchGames?: boolean;
  regeneratePlan?: boolean;
  filters?: ImportedGamesFilters;
};

export type ForceSyncSummary = {
  providerSync: {
    attempted: Array<"lichess" | "chesscom">;
    results: Array<ImportSummary>;
  };
  rematch: {
    scannedCount: number;
    updatedCount: number;
  };
  trainingPlan: {
    generated: boolean;
    itemCount: number;
    planId?: string;
  };
};

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
  return runAutoSyncForDueAccountsInternal(async (userId, input) => {
    await importGamesForUser(userId, input);
    await forceSynchronizeForUser(userId, {
      forceProviderSync: false,
      rematchGames: true,
      regeneratePlan: true,
    });
  }, maxAccounts);
}

export async function forceSynchronizeForUser(
  userId: string,
  options: ForceSyncOptions = {}
): Promise<ForceSyncSummary> {
  const forceProviderSync = options.forceProviderSync ?? true;
  const rematchGames = options.rematchGames ?? true;
  const regeneratePlan = options.regeneratePlan ?? true;
  const filters = options.filters;

  const providerSyncResults: ImportSummary[] = [];
  const attemptedProviders: Array<"lichess" | "chesscom"> = [];

  if (forceProviderSync) {
    const accounts = await listLinkedAccountsForUser(userId);
    for (const account of accounts) {
      attemptedProviders.push(account.provider);
      const summary = await importGamesForUserInternal(userId, { source: account.provider });
      providerSyncResults.push(summary);
    }
  }

  const rematch = rematchGames
    ? await rematchImportedGamesForUser(userId, filters || {})
    : { scannedCount: 0, updatedCount: 0 };

  const trainingPlan = regeneratePlan
    ? await generateTrainingPlanForUser(userId, undefined, filters)
    : null;

  return {
    providerSync: {
      attempted: attemptedProviders,
      results: providerSyncResults,
    },
    rematch,
    trainingPlan: {
      generated: Boolean(trainingPlan),
      itemCount: trainingPlan?.items.length || 0,
      ...(trainingPlan?.id ? { planId: trainingPlan.id } : {}),
    },
  };
}
