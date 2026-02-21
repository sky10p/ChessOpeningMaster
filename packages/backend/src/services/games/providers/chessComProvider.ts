import { parsePgnGames } from "../pgnProcessing";

export interface ChessComImportOptions {
  username: string;
  since?: Date;
  max?: number;
}

interface ChessComArchiveGame {
  uuid?: string;
  pgn?: string;
  end_time?: number;
  eco?: string;
  time_class?: string;
  time_control?: string;
}

interface ChessComFetchPolicy {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  archiveDelayMs: number;
}

const CHESSCOM_DEFAULT_POLICY: ChessComFetchPolicy = {
  maxAttempts: 4,
  baseDelayMs: 400,
  maxDelayMs: 5000,
  archiveDelayMs: 250,
};

const parsePolicyNumber = (value: string | undefined, fallback: number, minimum: number): number => {
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(minimum, Math.floor(parsed));
};

const getChessComFetchPolicy = (): ChessComFetchPolicy => {
  const maxAttempts = parsePolicyNumber(process.env.CHESSCOM_RETRY_MAX_ATTEMPTS, CHESSCOM_DEFAULT_POLICY.maxAttempts, 1);
  const baseDelayMs = parsePolicyNumber(process.env.CHESSCOM_RETRY_BASE_DELAY_MS, CHESSCOM_DEFAULT_POLICY.baseDelayMs, 0);
  const maxDelayMs = parsePolicyNumber(process.env.CHESSCOM_RETRY_MAX_DELAY_MS, CHESSCOM_DEFAULT_POLICY.maxDelayMs, 0);
  const archiveDelayMs = parsePolicyNumber(process.env.CHESSCOM_ARCHIVE_REQUEST_DELAY_MS, CHESSCOM_DEFAULT_POLICY.archiveDelayMs, 0);
  return {
    maxAttempts,
    baseDelayMs,
    maxDelayMs: Math.max(maxDelayMs, baseDelayMs),
    archiveDelayMs,
  };
};

const sleep = (delayMs: number): Promise<void> => new Promise((resolve) => {
  setTimeout(resolve, delayMs);
});

const parseRetryAfterMs = (value: string | null): number | undefined => {
  if (!value) {
    return undefined;
  }
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.floor(seconds * 1000);
  }
  const dateMs = new Date(value).getTime();
  if (Number.isNaN(dateMs)) {
    return undefined;
  }
  return Math.max(0, dateMs - Date.now());
};

const computeBackoffDelayMs = (attempt: number, policy: ChessComFetchPolicy, retryAfterMs?: number): number => {
  const exponent = Math.max(0, attempt - 1);
  const base = Math.min(policy.maxDelayMs, policy.baseDelayMs * 2 ** exponent);
  const jitter = base > 0 ? Math.floor(Math.random() * Math.max(1, Math.floor(base * 0.2))) : 0;
  const backoff = Math.min(policy.maxDelayMs, base + jitter);
  if (typeof retryAfterMs !== "number") {
    return backoff;
  }
  return Math.max(backoff, retryAfterMs);
};

const isRetryableStatus = (status: number): boolean => status === 429;

const fetchWithRetry = async (url: string, policy: ChessComFetchPolicy): Promise<Response> => {
  for (let attempt = 1; attempt <= policy.maxAttempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (!isRetryableStatus(response.status) || attempt === policy.maxAttempts) {
        return response;
      }
      const delayMs = computeBackoffDelayMs(attempt, policy, parseRetryAfterMs(response.headers.get("Retry-After")));
      if (delayMs > 0) {
        await sleep(delayMs);
      }
    } catch (error) {
      if (attempt === policy.maxAttempts) {
        throw error;
      }
      const delayMs = computeBackoffDelayMs(attempt, policy);
      if (delayMs > 0) {
        await sleep(delayMs);
      }
    }
  }
  throw new Error("Chess.com fetch failed after retries");
};

const monthFromArchive = (url: string): Date | null => {
  const match = url.match(/\/(\d{4})\/(\d{2})$/);
  if (!match) {
    return null;
  }
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1));
};

export const chessComProvider = {
  async importGames(options: ChessComImportOptions) {
    const policy = getChessComFetchPolicy();
    const archiveResponse = await fetchWithRetry(`https://api.chess.com/pub/player/${encodeURIComponent(options.username)}/games/archives`, policy);
    if (!archiveResponse.ok) {
      throw new Error(`Chess.com archive fetch failed: ${archiveResponse.status}`);
    }
    const archivesPayload = (await archiveResponse.json()) as { archives?: string[] };
    const archives = (archivesPayload.archives || []).filter((url) => {
      if (!options.since) {
        return true;
      }
      const month = monthFromArchive(url);
      return month ? month.getTime() >= options.since.getTime() - 31 * 24 * 60 * 60 * 1000 : true;
    });
    const ordered = archives.slice(-12).reverse();
    const games: Array<{ providerGameId?: string; pgn: string; ecoUrl?: string; timeClass?: string; timeControl?: string }> = [];
    for (let archiveIndex = 0; archiveIndex < ordered.length; archiveIndex += 1) {
      const archiveUrl = ordered[archiveIndex];
      if (options.max && games.length >= options.max) {
        break;
      }
      if (archiveIndex > 0 && policy.archiveDelayMs > 0) {
        await sleep(policy.archiveDelayMs);
      }
      const response = await fetchWithRetry(archiveUrl, policy);
      if (!response.ok) {
        throw new Error(`Chess.com monthly archive fetch failed: ${response.status} (${archiveUrl})`);
      }
      const payload = (await response.json()) as { games?: ChessComArchiveGame[] };
      (payload.games || []).forEach((game) => {
        if (!game.pgn) {
          return;
        }
        if (options.since && game.end_time && game.end_time * 1000 < options.since.getTime()) {
          return;
        }
        if (!options.max || games.length < options.max) {
          games.push({
            providerGameId: game.uuid,
            pgn: game.pgn,
            ecoUrl: game.eco,
            timeClass: game.time_class,
            timeControl: game.time_control,
          });
        }
      });
    }
    return games.flatMap((entry) => parsePgnGames(entry.pgn).map((parsed) => {
      const headers: Record<string, string> = { ...parsed.headers };
      if (!headers.ECOUrl && entry.ecoUrl) {
        headers.ECOUrl = entry.ecoUrl;
      }
      if (!headers.TimeControl && entry.timeControl) {
        headers.TimeControl = entry.timeControl;
      } else if (!headers.TimeControl && entry.timeClass) {
        headers.TimeControl = entry.timeClass;
      }
      return {
        ...parsed,
        headers,
        providerGameId: entry.providerGameId,
      };
    }));
  },
};
