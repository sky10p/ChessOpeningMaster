import { BoardOrientation } from "./Orientation";
import { ReviewRating, VariantMistake } from "./Variants";

export type TrainOpeningSummary = {
  repertoireId: string;
  repertoireName: string;
  openingName: string;
  orientation?: BoardOrientation;
  openingFen?: string;
  masteryScore: number;
  dueVariantsCount: number;
  dueMistakesCount: number;
  totalVariantsCount: number;
};

export type TrainOverviewRepertoire = {
  repertoireId: string;
  repertoireName: string;
  orientation?: BoardOrientation;
  openings: TrainOpeningSummary[];
};

export type TrainOverviewResponse = {
  repertoires: TrainOverviewRepertoire[];
};

export type TrainOpeningVariantItem = {
  repertoireId: string;
  variantName: string;
  openingName: string;
  orientation?: BoardOrientation;
  errors: number;
  dueAt?: Date;
  lastReviewedDayKey?: string;
  masteryScore: number;
  perfectRunStreak: number;
  dailyErrorCount: number;
  lastRating?: ReviewRating | null;
};

export type TrainOpeningStats = {
  masteryScore: number;
  dueVariantsCount: number;
  dueMistakesCount: number;
  totalVariantsCount: number;
  mistakesReducedLast7Days: number;
};

export type TrainOpeningResponse = {
  repertoireId: string;
  repertoireName: string;
  openingName: string;
  orientation?: BoardOrientation;
  openingFen?: string;
  stats: TrainOpeningStats;
  variants: TrainOpeningVariantItem[];
  mistakes: VariantMistake[];
};
