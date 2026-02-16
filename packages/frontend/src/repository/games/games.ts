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

export const getImportedGames = async (): Promise<ImportedGame[]> => {
  const response = await apiFetch(`${API_URL}/games/imports?limit=200`);
  await ensureOk(response, "Failed to load imported games");
  return parseJson<ImportedGame[]>(response);
};

export const getGamesStats = async (): Promise<GamesStatsSummary> => {
  const response = await apiFetch(`${API_URL}/games/stats`);
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
