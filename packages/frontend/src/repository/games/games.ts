import { GamesStatsSummary, ImportedGame, ImportSummary, LinkedGameAccount, TrainingPlan, TrainingPlanWeights } from "@chess-opening-master/common";
import { API_URL } from "../constants";
import { apiFetch } from "../apiClient";

const parseJson = async <T>(response: Response): Promise<T> => {
  const payload = await response.json();
  return payload as T;
};

const ensureOk = async (response: Response, fallback: string): Promise<void> => {
  if (response.ok) {
    return;
  }
  let message = fallback;
  try {
    const body = await response.json() as { message?: string };
    if (body.message) {
      message = body.message;
    }
  } catch {
    message = fallback;
  }
  throw new Error(message);
};

export const getLinkedAccounts = async (): Promise<LinkedGameAccount[]> => {
  const response = await apiFetch(`${API_URL}/games/accounts`);
  await ensureOk(response, "Failed to load linked accounts");
  return parseJson<LinkedGameAccount[]>(response);
};

export const saveLinkedAccount = async (provider: "lichess" | "chesscom", username: string, token?: string): Promise<LinkedGameAccount> => {
  const response = await apiFetch(`${API_URL}/games/accounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider, username, token }),
  });
  await ensureOk(response, "Failed to save linked account");
  return parseJson<LinkedGameAccount>(response);
};

export const removeLinkedAccount = async (provider: "lichess" | "chesscom"): Promise<void> => {
  const response = await apiFetch(`${API_URL}/games/accounts/${provider}`, { method: "DELETE" });
  await ensureOk(response, "Failed to disconnect account");
};

export const importGames = async (payload: {
  source: "lichess" | "chesscom" | "manual";
  username?: string;
  token?: string;
  pgn?: string;
  tournamentGroup?: string;
  tags?: string[];
}): Promise<ImportSummary> => {
  const response = await apiFetch(`${API_URL}/games/imports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  await ensureOk(response, "Failed to import games");
  return parseJson<ImportSummary>(response);
};

export interface ImportedGamesQuery {
  limit?: number;
  source?: "lichess" | "chesscom" | "manual";
  color?: "white" | "black";
  dateFrom?: string;
  dateTo?: string;
  timeControlBucket?: "bullet" | "blitz" | "rapid" | "classical";
  openingQuery?: string;
  mapped?: "mapped" | "unmapped" | "all";
}

const toSearchParams = (query?: ImportedGamesQuery): string => {
  const params = new URLSearchParams();
  if (!query) {
    return "";
  }
  if (typeof query.limit === "number" && Number.isFinite(query.limit)) {
    params.set("limit", String(query.limit));
  }
  if (query.source) {
    params.set("source", query.source);
  }
  if (query.color) {
    params.set("color", query.color);
  }
  if (query.dateFrom) {
    params.set("dateFrom", query.dateFrom);
  }
  if (query.dateTo) {
    params.set("dateTo", query.dateTo);
  }
  if (query.timeControlBucket) {
    params.set("timeControlBucket", query.timeControlBucket);
  }
  if (query.openingQuery) {
    params.set("openingQuery", query.openingQuery);
  }
  if (query.mapped && query.mapped !== "all") {
    params.set("mapped", query.mapped);
  }
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
};

export const getImportedGames = async (query?: ImportedGamesQuery): Promise<ImportedGame[]> => {
  const response = await apiFetch(`${API_URL}/games/imports${toSearchParams({ limit: 500, ...query })}`);
  await ensureOk(response, "Failed to load imported games");
  return parseJson<ImportedGame[]>(response);
};

export const deleteImportedGame = async (gameId: string): Promise<void> => {
  const response = await apiFetch(`${API_URL}/games/imports/${gameId}`, { method: "DELETE" });
  await ensureOk(response, "Failed to delete game");
};

export const clearImportedGames = async (query?: Omit<ImportedGamesQuery, "limit">): Promise<number> => {
  const response = await apiFetch(`${API_URL}/games/imports${toSearchParams(query)}`, { method: "DELETE" });
  await ensureOk(response, "Failed to clear imported games");
  const payload = await parseJson<{ deletedCount?: number }>(response);
  return payload.deletedCount || 0;
};

export interface GamesStatsQuery {
  source?: "lichess" | "chesscom" | "manual";
  color?: "white" | "black";
  dateFrom?: string;
  dateTo?: string;
  timeControlBucket?: "bullet" | "blitz" | "rapid" | "classical";
  openingQuery?: string;
  mapped?: "mapped" | "unmapped" | "all";
}

export const getGamesStats = async (query?: GamesStatsQuery): Promise<GamesStatsSummary> => {
  const response = await apiFetch(`${API_URL}/games/stats${toSearchParams(query)}`);
  await ensureOk(response, "Failed to load game stats");
  return parseJson<GamesStatsSummary>(response);
};

export const generateTrainingPlan = async (weights?: Partial<TrainingPlanWeights>): Promise<TrainingPlan> => {
  const response = await apiFetch(`${API_URL}/games/training-plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ weights }),
  });
  await ensureOk(response, "Failed to generate training plan");
  return parseJson<TrainingPlan>(response);
};

export const getTrainingPlan = async (): Promise<TrainingPlan | null> => {
  const response = await apiFetch(`${API_URL}/games/training-plan`);
  if (response.status === 404) {
    return null;
  }
  await ensureOk(response, "Failed to load training plan");
  return parseJson<TrainingPlan>(response);
};

export const setTrainingPlanItemDone = async (planId: string, lineKey: string, done: boolean): Promise<void> => {
  const response = await apiFetch(`${API_URL}/games/training-plan/${planId}/items/${lineKey}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ done }),
  });
  await ensureOk(response, "Failed to update plan item");
};
