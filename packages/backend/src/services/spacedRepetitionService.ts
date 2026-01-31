import { ResponseQuality, VariantState } from "@chess-opening-master/common";
import {
  DEFAULT_EASE_FACTOR,
  MIN_EASE_FACTOR,
  DEFAULT_INTERVAL,
  DEFAULT_REPETITIONS,
  DEFAULT_LAPSES,
} from "../models/VariantInfo";

export interface SRSData {
  easeFactor: number;
  interval: number;
  repetitions: number;
  state: VariantState;
  dueDate: Date;
  lapses: number;
}

export interface SRSResult extends SRSData {
  nextState: VariantState;
}

const LEARNING_STEPS_MINUTES = [1, 10];
const RELEARNING_STEPS_MINUTES = [10];
const GRADUATING_INTERVAL = 1;
const EASY_INTERVAL = 4;
const LAPSE_INTERVAL_MULTIPLIER = 0.5;
const HARD_INTERVAL_MULTIPLIER = 1.2;
const EASY_BONUS = 1.3;

export function getDefaultSRSData(): SRSData {
  return {
    easeFactor: DEFAULT_EASE_FACTOR,
    interval: DEFAULT_INTERVAL,
    repetitions: DEFAULT_REPETITIONS,
    state: "new",
    dueDate: new Date(),
    lapses: DEFAULT_LAPSES,
  };
}

export function calculateNextReview(
  current: Partial<SRSData>,
  quality: ResponseQuality
): SRSResult {
  const easeFactor = current.easeFactor ?? DEFAULT_EASE_FACTOR;
  const interval = current.interval ?? DEFAULT_INTERVAL;
  const repetitions = current.repetitions ?? DEFAULT_REPETITIONS;
  const state = current.state ?? "new";
  const lapses = current.lapses ?? DEFAULT_LAPSES;

  switch (state) {
    case "new":
      return handleNewCard(quality);
    case "learning":
      return handleLearningCard(quality, repetitions, easeFactor);
    case "review":
      return handleReviewCard(quality, interval, easeFactor, lapses);
    case "relearning":
      return handleRelearningCard(quality, interval, easeFactor, lapses);
    default:
      return handleNewCard(quality);
  }
}

function handleNewCard(quality: ResponseQuality): SRSResult {
  const now = new Date();

  if (quality === 0) {
    return {
      easeFactor: DEFAULT_EASE_FACTOR,
      interval: DEFAULT_INTERVAL,
      repetitions: 0,
      state: "learning",
      nextState: "learning",
      dueDate: addMinutes(now, LEARNING_STEPS_MINUTES[0]),
      lapses: 0,
    };
  }

  if (quality <= 2) {
    return {
      easeFactor: DEFAULT_EASE_FACTOR,
      interval: DEFAULT_INTERVAL,
      repetitions: 1,
      state: "learning",
      nextState: "learning",
      dueDate: addMinutes(now, LEARNING_STEPS_MINUTES[0]),
      lapses: 0,
    };
  }

  if (quality === 3) {
    return {
      easeFactor: DEFAULT_EASE_FACTOR,
      interval: GRADUATING_INTERVAL,
      repetitions: 1,
      state: "review",
      nextState: "review",
      dueDate: addDays(now, GRADUATING_INTERVAL),
      lapses: 0,
    };
  }

  return {
    easeFactor: DEFAULT_EASE_FACTOR,
    interval: EASY_INTERVAL,
    repetitions: 1,
    state: "review",
    nextState: "review",
    dueDate: addDays(now, EASY_INTERVAL),
    lapses: 0,
  };
}

function handleLearningCard(
  quality: ResponseQuality,
  repetitions: number,
  easeFactor: number
): SRSResult {
  const now = new Date();

  if (quality <= 1) {
    return {
      easeFactor,
      interval: DEFAULT_INTERVAL,
      repetitions: 0,
      state: "learning",
      nextState: "learning",
      dueDate: addMinutes(now, LEARNING_STEPS_MINUTES[0]),
      lapses: 0,
    };
  }

  const stepIndex = Math.min(repetitions, LEARNING_STEPS_MINUTES.length - 1);

  if (quality === 2) {
    return {
      easeFactor,
      interval: DEFAULT_INTERVAL,
      repetitions: repetitions,
      state: "learning",
      nextState: "learning",
      dueDate: addMinutes(now, LEARNING_STEPS_MINUTES[stepIndex]),
      lapses: 0,
    };
  }

  if (quality === 3) {
    if (repetitions >= LEARNING_STEPS_MINUTES.length - 1) {
      return {
        easeFactor,
        interval: GRADUATING_INTERVAL,
        repetitions: repetitions + 1,
        state: "review",
        nextState: "review",
        dueDate: addDays(now, GRADUATING_INTERVAL),
        lapses: 0,
      };
    }
    return {
      easeFactor,
      interval: DEFAULT_INTERVAL,
      repetitions: repetitions + 1,
      state: "learning",
      nextState: "learning",
      dueDate: addMinutes(now, LEARNING_STEPS_MINUTES[stepIndex + 1]),
      lapses: 0,
    };
  }

  return {
    easeFactor,
    interval: EASY_INTERVAL,
    repetitions: repetitions + 1,
    state: "review",
    nextState: "review",
    dueDate: addDays(now, EASY_INTERVAL),
    lapses: 0,
  };
}

function handleReviewCard(
  quality: ResponseQuality,
  interval: number,
  easeFactor: number,
  lapses: number
): SRSResult {
  const now = new Date();

  if (quality <= 1) {
    const newLapses = lapses + 1;
    const newInterval = Math.max(1, Math.floor(interval * LAPSE_INTERVAL_MULTIPLIER));
    const newEaseFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.2);

    return {
      easeFactor: newEaseFactor,
      interval: newInterval,
      repetitions: 0,
      state: "relearning",
      nextState: "relearning",
      dueDate: addMinutes(now, RELEARNING_STEPS_MINUTES[0]),
      lapses: newLapses,
    };
  }

  let newEaseFactor = easeFactor;
  let newInterval: number;

  if (quality === 2) {
    newEaseFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.15);
    newInterval = Math.ceil(interval * HARD_INTERVAL_MULTIPLIER);
  } else if (quality === 3) {
    newInterval = Math.ceil(interval * easeFactor);
  } else {
    newEaseFactor = easeFactor + 0.15;
    newInterval = Math.ceil(interval * easeFactor * EASY_BONUS);
  }

  newInterval = Math.max(interval + 1, newInterval);
  newInterval = Math.min(newInterval, 365);

  return {
    easeFactor: newEaseFactor,
    interval: newInterval,
    repetitions: 1,
    state: "review",
    nextState: "review",
    dueDate: addDays(now, newInterval),
    lapses,
  };
}

function handleRelearningCard(
  quality: ResponseQuality,
  interval: number,
  easeFactor: number,
  lapses: number
): SRSResult {
  const now = new Date();

  if (quality <= 1) {
    return {
      easeFactor,
      interval,
      repetitions: 0,
      state: "relearning",
      nextState: "relearning",
      dueDate: addMinutes(now, RELEARNING_STEPS_MINUTES[0]),
      lapses,
    };
  }

  const newInterval = Math.max(1, Math.floor(interval * LAPSE_INTERVAL_MULTIPLIER));

  return {
    easeFactor,
    interval: newInterval,
    repetitions: 1,
    state: "review",
    nextState: "review",
    dueDate: addDays(now, newInterval),
    lapses,
  };
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function isDue(dueDate: Date | undefined): boolean {
  if (!dueDate) return true;
  return new Date(dueDate) <= new Date();
}

export function getOverdueDays(dueDate: Date | undefined): number {
  if (!dueDate) return 0;
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = now.getTime() - due.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
