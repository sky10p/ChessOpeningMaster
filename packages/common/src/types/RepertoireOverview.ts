import { BoardOrientation } from "./Orientation";

export type VariantStatusCounts = {
  total: number;
  noErrors: number;
  oneError: number;
  twoErrors: number;
  moreThanTwoErrors: number;
  unresolved: number;
};

export type RepertoireOverviewOpening = {
  repertoireId: string;
  repertoireName: string;
  openingName: string;
  orientation?: BoardOrientation;
  openingFen?: string;
  masteryScore: number;
  dueVariantsCount: number;
  dueMistakesCount: number;
  totalVariantsCount: number;
  statusCounts: VariantStatusCounts;
};

export type RepertoireOverviewItem = {
  repertoireId: string;
  repertoireName: string;
  orientation?: BoardOrientation;
  order: number;
  disabled: boolean;
  favorite: boolean;
  openingCount: number;
  totalVariantsCount: number;
  masteryScore: number;
  dueVariantsCount: number;
  dueMistakesCount: number;
  statusCounts: VariantStatusCounts;
  openings: RepertoireOverviewOpening[];
};

export type RepertoireOverviewResponse = {
  repertoires: RepertoireOverviewItem[];
};
