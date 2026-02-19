import { GameTimeControlBucket } from "@chess-opening-master/common";

export interface ImportedGamesFilters {
  source?: "lichess" | "chesscom" | "manual";
  color?: "white" | "black";
  dateFrom?: string;
  dateTo?: string;
  timeControlBucket?: GameTimeControlBucket;
  openingQuery?: string;
  mapped?: "mapped" | "unmapped" | "all";
}
