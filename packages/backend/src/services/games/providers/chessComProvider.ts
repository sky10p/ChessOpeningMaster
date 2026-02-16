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
}

const monthFromArchive = (url: string): Date | null => {
  const match = url.match(/\/(\d{4})\/(\d{2})$/);
  if (!match) {
    return null;
  }
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1));
};

export const chessComProvider = {
  async importGames(options: ChessComImportOptions) {
    const archiveResponse = await fetch(`https://api.chess.com/pub/player/${encodeURIComponent(options.username)}/games/archives`);
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
    const games: Array<{ providerGameId?: string; pgn: string }> = [];
    for (const archiveUrl of ordered) {
      if (options.max && games.length >= options.max) {
        break;
      }
      const response = await fetch(archiveUrl);
      if (!response.ok) {
        continue;
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
          games.push({ providerGameId: game.uuid, pgn: game.pgn });
        }
      });
    }
    return games.flatMap((entry) => parsePgnGames(entry.pgn).map((parsed) => ({ ...parsed, providerGameId: entry.providerGameId })));
  },
};
