import { parsePgnGames } from "../pgnProcessing";

export interface LichessImportOptions {
  username: string;
  token?: string;
  since?: Date;
  max?: number;
}

const splitNdjson = (raw: string): string[] => raw.split("\n").map((line) => line.trim()).filter(Boolean);

export const lichessProvider = {
  async importGames(options: LichessImportOptions) {
    const params = new URLSearchParams();
    params.set("pgnInJson", "true");
    params.set("opening", "true");
    params.set("max", String(options.max || 100));
    if (options.since) {
      params.set("since", String(options.since.getTime()));
    }
    const response = await fetch(`https://lichess.org/api/games/user/${encodeURIComponent(options.username)}?${params.toString()}`, {
      headers: {
        Accept: "application/x-ndjson",
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
    });
    if (!response.ok) {
      throw new Error(`Lichess import failed: ${response.status}`);
    }
    const raw = await response.text();
    const games = splitNdjson(raw)
      .map((line) => JSON.parse(line) as {
        id?: string;
        pgn?: string;
        speed?: string;
        clock?: { initial?: number; increment?: number };
        opening?: { eco?: string; name?: string };
      })
      .filter((entry) => Boolean(entry.pgn));
    return games.flatMap((entry) => parsePgnGames(entry.pgn || "").map((parsed) => {
      const headers: Record<string, string> = { ...parsed.headers };
      if (!headers.ECO && entry.opening?.eco) {
        headers.ECO = entry.opening.eco;
      }
      if (!headers.Opening && entry.opening?.name) {
        headers.Opening = entry.opening.name;
      }
      if (!headers.TimeControl && typeof entry.clock?.initial === "number") {
        headers.TimeControl = `${entry.clock.initial}+${typeof entry.clock.increment === "number" ? entry.clock.increment : 0}`;
      } else if (!headers.TimeControl && entry.speed) {
        headers.TimeControl = entry.speed;
      }
      return {
        ...parsed,
        headers,
        providerGameId: entry.id,
      };
    }));
  },
};
