import { IRepertoireDashboard } from "@chess-opening-master/common";

export type FilterType = "all" | "white" | "black" | "errors" | "unreviewed";

export type VariantInfo = { errors?: number; lastDate?: string | Date };

export interface OpeningRatioStats {
  opening: string;
  ratio: number;
  totalVariants: number;
  problemVariants: number;
}

export interface OpeningStats {
  opening: string;
  count: number;
}

export interface VariantWithErrors {
  fullName: string;
  errors: number;
  repertoireId: string;
  repertoireName: string;
}

export interface OpeningWithVariants {
  opening: string;
  count: number;
  variants: VariantWithErrors[];
}

export interface ReviewDataItem {
  name: string;
  value: number;
}

export interface ReviewActivityItem {
  date: string;
  count: number;
}

export interface DashboardSectionProps {
  repertoires: IRepertoireDashboard[];
}

export interface ProgressStats {
  neverReviewed: number;
  reviewedWithErrors: number;
  reviewedOK: number;
  reviewedToday: number;
  reviewedTodayErrors: number;
  reviewedTodayOk: number;
}

export interface ChartMargins {
  top: number;
  right: number;
  left: number;
  bottom: number;
}

export interface OpeningProgressData {
  opening: string;
  totalVariants: number;
  mastered: number;
  withProblems: number;
  ratio: number;
}
