import { parsePgnGames } from "../pgnProcessing";

export const manualPgnProvider = {
  async importGames(rawPgn: string) {
    return parsePgnGames(rawPgn);
  },
};
