import { GamesTab, GlobalFilterState } from "./types";

export const providerOptions: Array<{ value: "lichess" | "chesscom"; label: string }> = [
  { value: "lichess", label: "Lichess" },
  { value: "chesscom", label: "Chess.com" },
];

export const tabs: Array<{ id: GamesTab; label: string }> = [
  { id: "insights", label: "Insights" },
  { id: "training", label: "Training" },
  { id: "sync", label: "Sync" },
  { id: "data", label: "Data" },
];

export const defaultFilters: GlobalFilterState = {
  source: "all",
  color: "all",
  mapped: "all",
  timeControlBucket: "all",
  openingQuery: "",
  dateFrom: "",
  dateTo: "",
};
