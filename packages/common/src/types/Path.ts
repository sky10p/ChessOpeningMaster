
import { ReviewRating } from "./Variants";
import { BoardOrientation } from "./Orientation";

export interface StudiedVariantPath {
  type: "variant";
  id: string;
  repertoireId: string;
  repertoireName: string;
  name: string;
  errors: number;
  lastDate: Date;
  dueAt?: Date;
  lastReviewedDayKey?: string;
  lastRating?: ReviewRating | null;
  orientation?: BoardOrientation;
  openingName?: string;
  startingFen?: string;
}

export interface NewVariantPath {
  type: "newVariant";
  repertoireId: string;
  repertoireName: string;
  name: string;
  orientation?: BoardOrientation;
  openingName?: string;
  startingFen?: string;
}

export interface StudyPath {
  type: "study";
  groupId: string;
  studyId: string;
  name: string;
  lastSession: string | null;
}

export interface EmptyPath {
  message: string;
}

export type Path = StudiedVariantPath | NewVariantPath | StudyPath | EmptyPath;

export type PathCategory = 'variantsWithErrors' | 'newVariants' | 'oldVariants' | 'studyToReview';

export interface PathSelectionFilters {
  orientation?: BoardOrientation;
  openingName?: string;
  fen?: string;
}

export interface PathPlanPoint {
  date: string;
  dueCount: number;
}

export interface PathForecastVariant {
  variantName: string;
  repertoireId: string;
  repertoireName: string;
  dueDate: string;
  openingName: string;
  orientation?: BoardOrientation;
  errors: number;
}

export interface PathForecastDay {
  date: string;
  dueCount: number;
  topOpenings: PathNamedCount[];
  variants: PathForecastVariant[];
}

export interface PathPlanSummary {
  todayKey: string;
  overdueCount: number;
  dueTodayCount: number;
  reviewDueCount: number;
  completedTodayCount: number;
  newVariantsAvailable: number;
  suggestedNewToday: number;
  estimatedTodayTotal: number;
  upcoming: PathPlanPoint[];
  forecastDays: PathForecastDay[];
  nextVariants: PathForecastVariant[];
  upcomingOpenings: PathNamedCount[];
}

export interface PathDailyReviewPoint {
  date: string;
  count: number;
}

export interface PathNamedCount {
  name: string;
  count: number;
}

export interface PathFenCount {
  fen: string;
  count: number;
}

export interface PathAnalyticsSummary {
  rangeStart: string;
  rangeEnd: string;
  totalReviews: number;
  ratingBreakdown: Record<ReviewRating, number>;
  dailyReviews: PathDailyReviewPoint[];
  topOpenings: PathNamedCount[];
  topFens: PathFenCount[];
}
