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
    const games = splitNdjson(raw).map((line) => JSON.parse(line) as { id?: string; pgn?: string }).filter((entry) => Boolean(entry.pgn));
    return games.flatMap((entry) => parsePgnGames(entry.pgn || "").map((parsed) => ({ ...parsed, providerGameId: entry.id })));
  },
};
