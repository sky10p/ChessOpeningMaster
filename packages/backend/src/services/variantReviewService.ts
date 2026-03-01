import { getDB } from "../db/mongo";
import {
  computeNextMastery,
  getOpeningNameFromVariant,
  mergeMistakeSnapshotItems,
  MistakeSnapshotItem,
  ReviewRating,
} from "@chess-opening-master/common";
import {
  computeNextSchedule,
  getSchedulerVersion,
  inferSuggestedRatingFromMetrics,
} from "./spacedRepetitionService";
import { VariantReviewHistory } from "../models/VariantReviewHistory";
import { VariantInfo } from "../models/VariantInfo";
import { ObjectId } from "mongodb";
import {
  archiveMissingMistakesFromSnapshot,
  upsertMistakesFromSnapshot,
} from "./variantMistakeService";

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
  mistakes?: MistakeSnapshotItem[];
}

function normalizeNonNegativeInt(value: number | undefined): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.floor(value as number));
}

function normalizeMistakeSnapshot(
  mistakes: MistakeSnapshotItem[] | undefined,
  variantName: string
): MistakeSnapshotItem[] {
  if (!Array.isArray(mistakes)) {
    return [];
  }
  const result: MistakeSnapshotItem[] = [];
  const seenKeys = new Set<string>();
  for (const mistake of mistakes) {
    if (!mistake || typeof mistake !== "object") {
      continue;
    }
    const key = typeof mistake.mistakeKey === "string" ? mistake.mistakeKey.trim() : "";
    const expectedMoveLan =
      typeof mistake.expectedMoveLan === "string"
        ? mistake.expectedMoveLan.trim()
        : "";
    const positionFen = typeof mistake.positionFen === "string" ? mistake.positionFen.trim() : "";
    if (!key || !expectedMoveLan || !positionFen || seenKeys.has(key)) {
      continue;
    }
    seenKeys.add(key);
    result.push({
      mistakeKey: key,
      mistakePly: Math.max(1, Math.floor(mistake.mistakePly || 1)),
      variantStartPly: Math.max(0, Math.floor(mistake.variantStartPly || 0)),
      positionFen,
      expectedMoveLan,
      expectedMoveSan:
        typeof mistake.expectedMoveSan === "string"
          ? mistake.expectedMoveSan.trim()
          : undefined,
      actualMoveLan:
        typeof mistake.actualMoveLan === "string"
          ? mistake.actualMoveLan.trim()
          : undefined,
    });
  }
  return result.filter((mistake) => mistake.mistakeKey.startsWith(`${variantName}::`));
}

interface ErrorWithStatus extends Error {
  status?: number;
}

function createNotFoundError(message: string): ErrorWithStatus {
  const error = new Error(message) as ErrorWithStatus;
  error.status = 404;
  return error;
}

async function ensureRepertoireBelongsToUser(
  userId: string,
  repertoireId: string
): Promise<void> {
  if (!ObjectId.isValid(repertoireId)) {
    throw createNotFoundError("Repertoire not found");
  }
  const db = getDB();
  const repertoire = await db.collection("repertoires").findOne({
    _id: new ObjectId(repertoireId),
    userId,
  });
  if (!repertoire) {
    throw createNotFoundError("Repertoire not found");
  }
}

export async function saveVariantReview(input: SaveVariantReviewInput): Promise<{
  variantInfo: VariantInfoDocument;
  review: VariantReviewHistory;
}> {
  await ensureRepertoireBelongsToUser(input.userId, input.repertoireId);
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
  const incomingMistakes = normalizeMistakeSnapshot(input.mistakes, input.variantName);
  const hasExplicitMistakeSnapshot = Array.isArray(input.mistakes);
  const todayDayKey = now.toISOString().slice(0, 10);
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
  const existingSnapshot = Array.isArray(existing?.dailyErrorSnapshot)
    ? existing?.dailyErrorSnapshot ?? []
    : [];
  const sameDaySnapshot = existing?.dailyErrorsDayKey === todayDayKey;
  const nextSnapshot = sameDaySnapshot
    ? mergeMistakeSnapshotItems(existingSnapshot, incomingMistakes)
    : incomingMistakes;
  const incomingErrorBase = incomingMistakes.length > 0 ? incomingMistakes.length : wrongMoves;
  const previousDailyErrorCount = normalizeNonNegativeInt(existing?.dailyErrorCount);
  const nextDailyErrorCount = sameDaySnapshot
    ? Math.max(previousDailyErrorCount, incomingErrorBase, nextSnapshot.length)
    : Math.max(incomingErrorBase, nextSnapshot.length);
  const previousMastery = typeof existing?.masteryScore === "number" ? existing.masteryScore : 0;
  const nextMastery = computeNextMastery({
    previousMastery,
    rating: input.rating,
    wrongMoves,
    ignoredWrongMoves,
    hintsUsed,
  });
  const perfectRun = wrongMoves === 0 && ignoredWrongMoves === 0 && hintsUsed === 0;
  const nextPerfectRunStreak = perfectRun
    ? normalizeNonNegativeInt(existing?.perfectRunStreak) + 1
    : 0;
  const openingName =
    input.openingName || existing?.openingName || getOpeningNameFromVariant(input.variantName);
  const startingFen = input.startingFen || existing?.startingFen;
  const orientation = input.orientation || existing?.orientation;

  const setPayload = {
    userId: input.userId,
    repertoireId: input.repertoireId,
    variantName: input.variantName,
    errors: nextDailyErrorCount,
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
    openingName,
    startingFen,
    orientation,
    dailyErrorsDayKey: todayDayKey,
    dailyErrorSnapshot: nextSnapshot,
    dailyErrorCount: nextDailyErrorCount,
    masteryScore: nextMastery,
    perfectRunStreak: nextPerfectRunStreak,
    masteryUpdatedAt: now,
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

  if (incomingMistakes.length > 0 && startingFen) {
    await upsertMistakesFromSnapshot({
      userId: input.userId,
      repertoireId: input.repertoireId,
      variantName: input.variantName,
      openingName,
      orientation,
      variantStartFen: startingFen,
      mistakes: incomingMistakes,
      now,
    });
  }

  if (hasExplicitMistakeSnapshot && !sameDaySnapshot) {
    await archiveMissingMistakesFromSnapshot({
      userId: input.userId,
      repertoireId: input.repertoireId,
      variantName: input.variantName,
      activeMistakeKeys: incomingMistakes.map((mistake) => mistake.mistakeKey),
      now,
    });
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
    startingFen,
    openingName,
    orientation,
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
