import { getDB } from "../db/mongo";
import { ReviewRating } from "@chess-opening-master/common";
import { computeNextSchedule, getSchedulerVersion, inferSuggestedRatingFromMetrics } from "./spacedRepetitionService";
import { VariantReviewHistory } from "../models/VariantReviewHistory";
import { VariantInfo } from "../models/VariantInfo";

type VariantInfoDocument = VariantInfo & {
  userId: string;
};

export interface SaveVariantReviewInput {
  userId: string;
  repertoireId: string;
  variantName: string;
  rating: ReviewRating;
  suggestedRating?: ReviewRating;
  acceptedSuggested?: boolean;
  wrongMoves?: number;
  ignoredWrongMoves?: number;
  hintsUsed?: number;
  timeSpentSec?: number;
  startingFen?: string;
  openingName?: string;
  orientation?: "white" | "black";
}

function normalizeNonNegativeInt(value: number | undefined): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.floor(value as number));
}

export async function saveVariantReview(input: SaveVariantReviewInput): Promise<{
  variantInfo: VariantInfoDocument;
  review: VariantReviewHistory;
}> {
  const db = getDB();
  const now = new Date();
  const filter = {
    userId: input.userId,
    repertoireId: input.repertoireId,
    variantName: input.variantName,
  };

  const existing = await db.collection<VariantInfoDocument>("variantsInfo").findOne(filter);
  const wrongMoves = normalizeNonNegativeInt(input.wrongMoves);
  const ignoredWrongMoves = normalizeNonNegativeInt(input.ignoredWrongMoves);
  const hintsUsed = normalizeNonNegativeInt(input.hintsUsed);
  const timeSpentSec = normalizeNonNegativeInt(input.timeSpentSec);
  const suggestedRating = input.suggestedRating || inferSuggestedRatingFromMetrics(wrongMoves, hintsUsed, timeSpentSec);
  const acceptedSuggested =
    typeof input.acceptedSuggested === "boolean"
      ? input.acceptedSuggested
      : suggestedRating === input.rating;
  const schedule = computeNextSchedule(
    {
      intervalDays: existing?.intervalDays,
      ease: existing?.ease,
      reps: existing?.reps,
      lapses: existing?.lapses,
    },
    input.rating,
    now
  );

  const setPayload = {
    userId: input.userId,
    repertoireId: input.repertoireId,
    variantName: input.variantName,
    errors: wrongMoves,
    lastDate: now,
    dueAt: schedule.dueAt,
    lastReviewedAt: schedule.lastReviewedAt,
    lastReviewedDayKey: schedule.lastReviewedDayKey,
    state: schedule.state,
    stability: schedule.stability,
    difficulty: schedule.difficulty,
    reps: schedule.reps,
    lapses: schedule.lapses,
    intervalDays: schedule.intervalDays,
    ease: schedule.ease,
    lastRating: schedule.lastRating,
    openingName: input.openingName,
    startingFen: input.startingFen,
    orientation: input.orientation,
  };

  await db.collection<VariantInfoDocument>("variantsInfo").updateOne(
    filter,
    { $set: setPayload },
    { upsert: true }
  );

  const variantInfo = await db.collection<VariantInfoDocument>("variantsInfo").findOne(filter);
  if (!variantInfo) {
    throw new Error("Failed to persist variant review");
  }

  const review: VariantReviewHistory = {
    userId: input.userId,
    repertoireId: input.repertoireId,
    variantName: input.variantName,
    isFirstReview: !existing,
    reviewedAt: now,
    reviewedDayKey: schedule.lastReviewedDayKey,
    rating: input.rating,
    suggestedRating,
    acceptedSuggested,
    wrongMoves,
    ignoredWrongMoves,
    hintsUsed,
    timeSpentSec,
    startingFen: input.startingFen,
    openingName: input.openingName,
    orientation: input.orientation,
    dueBeforeReviewAt: existing?.dueAt
      ? new Date(existing.dueAt)
      : existing?.lastDate
        ? new Date(existing.lastDate)
        : null,
    nextDueAt: schedule.dueAt,
    schedulerVersion: getSchedulerVersion(),
  };

  await db.collection<VariantReviewHistory>("variantReviewHistory").insertOne(review);

  return {
    variantInfo,
    review,
  };
}
