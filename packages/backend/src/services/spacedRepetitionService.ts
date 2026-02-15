import { ReviewRating, SchedulerState } from "@chess-opening-master/common";

export interface SchedulerFields {
  dueAt: Date;
  lastReviewedAt: Date;
  lastReviewedDayKey: string;
  state: SchedulerState;
  stability: number;
  difficulty: number;
  reps: number;
  lapses: number;
  intervalDays: number;
  ease: number;
  lastRating: ReviewRating;
}

export interface SchedulerSeed {
  intervalDays?: number;
  ease?: number;
  reps?: number;
  lapses?: number;
}

const MIN_EASE = 1.3;
const MAX_EASE = 2.8;
const DEFAULT_EASE = 2.3;
const DIFFICULTY_BASELINE = 6;
const SCHEDULER_VERSION = "sm2-v1";

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function normalizeNonNegativeInt(value: number | undefined, fallback: number): number {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(0, Math.floor(value as number));
}

function normalizePositiveInt(value: number | undefined, fallback: number): number {
  if (!Number.isFinite(value) || (value as number) <= 0) {
    return fallback;
  }
  return Math.floor(value as number);
}

export function getUtcDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addUtcDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function sanitizeRating(value: unknown): ReviewRating | null {
  if (value === "again" || value === "hard" || value === "good" || value === "easy") {
    return value;
  }
  return null;
}

export function parseReviewRating(value: unknown): ReviewRating | null {
  return sanitizeRating(value);
}

export function inferSuggestedRatingFromMetrics(
  wrongMoves: number,
  hintsUsed: number,
  timeSpentSec: number
): ReviewRating {
  if (wrongMoves >= 3) {
    return "again";
  }
  if (wrongMoves >= 2 || hintsUsed >= 2) {
    return "hard";
  }
  if (wrongMoves === 0 && hintsUsed === 0 && timeSpentSec > 0 && timeSpentSec <= 45) {
    return "easy";
  }
  return "good";
}

export function inferSuggestedRatingFromLegacyErrors(errors: number): ReviewRating {
  if (errors >= 3) {
    return "again";
  }
  if (errors >= 1) {
    return "hard";
  }
  return "good";
}

export function getSchedulerVersion(): string {
  return SCHEDULER_VERSION;
}

export function computeNextSchedule(
  previous: SchedulerSeed,
  rating: ReviewRating,
  now: Date = new Date()
): SchedulerFields {
  const prevIntervalDays = normalizePositiveInt(previous.intervalDays, 1);
  const prevEase = clamp(
    Number.isFinite(previous.ease) ? (previous.ease as number) : DEFAULT_EASE,
    MIN_EASE,
    MAX_EASE
  );
  const prevReps = normalizeNonNegativeInt(previous.reps, 0);
  const prevLapses = normalizeNonNegativeInt(previous.lapses, 0);

  let reps = prevReps;
  let lapses = prevLapses;
  let ease = prevEase;
  let intervalDays = prevIntervalDays;
  let state: SchedulerState = prevReps > 0 ? "review" : "new";

  if (rating === "again") {
    reps = 0;
    lapses = prevLapses + 1;
    intervalDays = 1;
    ease = clamp(prevEase - 0.2, MIN_EASE, MAX_EASE);
    state = "learning";
  } else if (rating === "hard") {
    reps = prevReps + 1;
    intervalDays = Math.max(1, Math.round(prevIntervalDays * 1.2));
    ease = clamp(prevEase - 0.15, MIN_EASE, MAX_EASE);
    state = reps < 3 ? "learning" : "review";
  } else if (rating === "good") {
    reps = prevReps + 1;
    if (reps === 1) {
      intervalDays = 1;
    } else if (reps === 2) {
      intervalDays = 3;
    } else {
      intervalDays = Math.max(1, Math.round(prevIntervalDays * prevEase));
    }
    state = reps < 3 ? "learning" : "review";
  } else {
    reps = prevReps + 1;
    intervalDays = Math.max(4, Math.round(prevIntervalDays * prevEase * 1.3));
    ease = clamp(prevEase + 0.15, MIN_EASE, MAX_EASE);
    state = "review";
  }

  intervalDays = Math.max(1, intervalDays);

  const todayStart = startOfUtcDay(now);
  let dueAt = startOfUtcDay(addUtcDays(todayStart, intervalDays));
  if (getUtcDayKey(dueAt) === getUtcDayKey(now)) {
    dueAt = startOfUtcDay(addUtcDays(todayStart, 1));
  }

  const stability = intervalDays;
  const difficulty = Math.max(1, Number((DIFFICULTY_BASELINE - ease).toFixed(2)));

  return {
    dueAt,
    lastReviewedAt: now,
    lastReviewedDayKey: getUtcDayKey(now),
    state,
    stability,
    difficulty,
    reps,
    lapses,
    intervalDays,
    ease,
    lastRating: rating,
  };
}
