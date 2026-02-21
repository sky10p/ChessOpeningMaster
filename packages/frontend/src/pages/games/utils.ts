import { ImportedGame } from "@chess-opening-master/common";
import { ImportedGamesQuery } from "../../repository/games/games";
import { GlobalFilterState } from "./types";

export const formatDateTime = (value?: string): string => (value ? new Date(value).toLocaleString() : "n/a");
export const formatPercent = (value: number): string => `${(value * 100).toFixed(1)}%`;

export const normalizeLabel = (value?: string): string => (value || "").trim().toLowerCase();

export const isUnknownLabel = (value: string): boolean => normalizeLabel(value) === "unknown";

export const getOpeningLabel = (game: ImportedGame): string => (
  game.openingMapping.variantName
  || game.openingMapping.repertoireName
  || game.openingDetection.openingName
  || (game.openingDetection.eco ? `ECO ${game.openingDetection.eco}` : "Unknown")
);

export const buildLineTitle = (openingName: string, variantName?: string, repertoireName?: string): string => {
  const pieces = [openingName];
  const normalizedOpening = normalizeLabel(openingName);
  const normalizedVariant = normalizeLabel(variantName);
  const normalizedRepertoire = normalizeLabel(repertoireName);
  if (variantName && normalizedVariant && normalizedVariant !== normalizedOpening) {
    pieces.push(variantName);
  }
  if (repertoireName && normalizedRepertoire && normalizedRepertoire !== normalizedOpening && normalizedRepertoire !== normalizedVariant) {
    pieces.push(repertoireName);
  }
  return pieces.join(" | ");
};

export const outcomePercentages = (wins: number, draws: number, losses: number): { win: number; draw: number; loss: number } => {
  const total = wins + draws + losses;
  if (total <= 0) {
    return { win: 0, draw: 0, loss: 0 };
  }
  return {
    win: wins / total,
    draw: draws / total,
    loss: losses / total,
  };
};

export const toGamesFiltersQuery = (filters: GlobalFilterState): ImportedGamesQuery => ({
  source: filters.source === "all" ? undefined : filters.source,
  color: filters.color === "all" ? undefined : filters.color,
  mapped: filters.mapped,
  openingQuery: filters.openingQuery.trim() || undefined,
  dateFrom: filters.dateFrom || undefined,
  dateTo: filters.dateTo || undefined,
  timeControlBucket: filters.timeControlBucket === "all" ? undefined : filters.timeControlBucket,
});
