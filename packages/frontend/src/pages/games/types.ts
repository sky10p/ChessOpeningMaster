export type GamesTab = "insights" | "training" | "sync" | "data";

export type GlobalFilterState = {
  source: "all" | "lichess" | "chesscom" | "manual";
  color: "all" | "white" | "black";
  mapped: "all" | "mapped" | "unmapped";
  timeControlBucket: "all" | "bullet" | "blitz" | "rapid" | "classical";
  openingQuery: string;
  dateFrom: string;
  dateTo: string;
};
