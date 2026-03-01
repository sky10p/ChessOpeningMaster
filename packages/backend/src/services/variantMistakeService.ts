import {
  MistakeSnapshotItem,
  MoveVariantNode,
  ReviewRating,
  VariantMistake as VariantMistakeDto,
} from "@chess-opening-master/common";
import { getDB } from "../db/mongo";
import { VariantMistake } from "../models/VariantMistake";
import { ObjectId } from "mongodb";
import {
  computeNextSchedule,
  getUtcDayKey,
} from "./spacedRepetitionService";

interface ErrorWithStatus extends Error {
  status?: number;
}

const toUtcStartOfDay = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const addUtcDays = (date: Date, days: number): Date =>
  new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

const isSolvedRating = (rating: ReviewRating): boolean =>
  rating === "hard" || rating === "good" || rating === "easy";

const createNotFoundError = (message: string): ErrorWithStatus => {
  const error = new Error(message) as ErrorWithStatus;
  error.status = 404;
  return error;
};

const normalizeMistake = (mistake: MistakeSnapshotItem): MistakeSnapshotItem => ({
  mistakeKey: mistake.mistakeKey.trim(),
  mistakePly: Math.max(1, Math.floor(mistake.mistakePly)),
  variantStartPly: Math.max(0, Math.floor(mistake.variantStartPly)),
  positionFen: mistake.positionFen.trim(),
  expectedMoveLan: mistake.expectedMoveLan.trim(),
  expectedMoveSan: mistake.expectedMoveSan?.trim() || undefined,
  actualMoveLan: mistake.actualMoveLan?.trim() || undefined,
});

type RepertoireDocument = {
  _id: ObjectId;
  userId: string;
  moveNodes?: unknown;
};

export const buildMistakeKey = (
  variantName: string,
  mistakePly: number,
  expectedMoveLan: string,
  variantStartPly: number
): string =>
  `${variantName}::${Math.max(1, Math.floor(mistakePly))}::${expectedMoveLan.trim()}::${Math.max(
    0,
    Math.floor(variantStartPly)
  )}`;

export const upsertMistakesFromSnapshot = async (params: {
  userId: string;
  repertoireId: string;
  variantName: string;
  openingName: string;
  orientation?: "white" | "black";
  variantStartFen: string;
  mistakes: MistakeSnapshotItem[];
  now?: Date;
}): Promise<void> => {
  if (params.mistakes.length === 0) {
    return;
  }
  const db = getDB();
  const now = params.now || new Date();
  const tomorrow = toUtcStartOfDay(addUtcDays(toUtcStartOfDay(now), 1));
  const seenKeys = new Set<string>();
  for (const rawMistake of params.mistakes) {
    const mistake = normalizeMistake(rawMistake);
    if (
      !mistake.mistakeKey ||
      !mistake.positionFen ||
      !mistake.expectedMoveLan ||
      seenKeys.has(mistake.mistakeKey)
    ) {
      continue;
    }
    seenKeys.add(mistake.mistakeKey);
    const filter = {
      userId: params.userId,
      repertoireId: params.repertoireId,
      variantName: params.variantName,
      mistakeKey: mistake.mistakeKey,
    };
    await db.collection<VariantMistake>("variantMistakes").updateOne(
      filter,
      {
        $set: {
          openingName: params.openingName,
          orientation: params.orientation,
          positionFen: mistake.positionFen,
          variantStartFen: params.variantStartFen,
          variantStartPly: mistake.variantStartPly,
          mistakePly: mistake.mistakePly,
          expectedMoveLan: mistake.expectedMoveLan,
          expectedMoveSan: mistake.expectedMoveSan,
          updatedAt: now,
        },
        $unset: { archivedAt: "" },
        $setOnInsert: {
          userId: params.userId,
          repertoireId: params.repertoireId,
          variantName: params.variantName,
          seenCount: 0,
          solvedCount: 0,
          dueAt: tomorrow,
          state: "learning",
          stability: 1,
          difficulty: 4,
          reps: 0,
          lapses: 0,
          intervalDays: 1,
          ease: 2.3,
          createdAt: now,
        },
      },
      { upsert: true }
    );
  }
};

export const archiveMissingMistakesFromSnapshot = async (params: {
  userId: string;
  repertoireId: string;
  variantName: string;
  activeMistakeKeys: string[];
  now?: Date;
}): Promise<void> => {
  const db = getDB();
  const now = params.now || new Date();
  const filter: Record<string, unknown> = {
    userId: params.userId,
    repertoireId: params.repertoireId,
    variantName: params.variantName,
    archivedAt: { $exists: false },
  };

  if (params.activeMistakeKeys.length > 0) {
    filter.mistakeKey = { $nin: params.activeMistakeKeys };
  }

  await db.collection<VariantMistake>("variantMistakes").updateMany(
    filter,
    {
      $set: {
        archivedAt: now,
        updatedAt: now,
      },
    }
  );
};

const loadVariantMapForRepertoire = async (params: {
  userId: string;
  repertoireId: string;
}): Promise<Map<string, ReturnType<MoveVariantNode["getVariants"]>[number]>> => {
  const variantMap = new Map<string, ReturnType<MoveVariantNode["getVariants"]>[number]>();
  if (!ObjectId.isValid(params.repertoireId)) {
    return variantMap;
  }
  const db = getDB();
  const repertoire = await db.collection<RepertoireDocument>("repertoires").findOne({
    _id: new ObjectId(params.repertoireId),
    userId: params.userId,
  });
  if (!repertoire?.moveNodes) {
    return variantMap;
  }
  try {
    const tree = MoveVariantNode.initMoveVariantNode(repertoire.moveNodes as never);
    const variants = tree.getVariants();
    variants.forEach((variant) => {
      variantMap.set(variant.fullName, variant);
      if (!variantMap.has(variant.name)) {
        variantMap.set(variant.name, variant);
      }
    });
  } catch {
    return variantMap;
  }
  return variantMap;
};

const expectedMoveExistsInVariant = (
  variant: ReturnType<MoveVariantNode["getVariants"]>[number] | undefined,
  mistake: VariantMistake
): boolean => {
  if (!variant) {
    return false;
  }
  return variant.moves.some(
    (moveNode) =>
      moveNode.position === mistake.mistakePly &&
      moveNode.getMove().lan === mistake.expectedMoveLan
  );
};

export const archiveStaleMistakesForRepertoire = async (params: {
  userId: string;
  repertoireId: string;
  openingName?: string;
  now?: Date;
}): Promise<void> => {
  const db = getDB();
  const now = params.now || new Date();
  const query: Record<string, unknown> = {
    userId: params.userId,
    repertoireId: params.repertoireId,
    archivedAt: { $exists: false },
  };
  if (params.openingName?.trim()) {
    query.openingName = params.openingName.trim();
  }
  const mistakesCursor = db.collection<VariantMistake>("variantMistakes").find(
    query
  ) as {
    toArray?: () => Promise<VariantMistake[]>;
    sort?: (value: unknown) => { toArray: () => Promise<VariantMistake[]> };
  };
  const mistakes = typeof mistakesCursor.toArray === "function"
    ? await mistakesCursor.toArray()
    : typeof mistakesCursor.sort === "function"
      ? await mistakesCursor.sort({ updatedAt: -1 }).toArray()
      : [];
  if (mistakes.length === 0) {
    return;
  }
  const variantMap = await loadVariantMapForRepertoire({
    userId: params.userId,
    repertoireId: params.repertoireId,
  });
  if (variantMap.size === 0) {
    return;
  }
  const staleMistakeKeys = mistakes
    .filter((mistake) => {
      const variant = variantMap.get(mistake.variantName);
      return !expectedMoveExistsInVariant(variant, mistake);
    })
    .map((mistake) => mistake.mistakeKey);
  if (staleMistakeKeys.length === 0) {
    return;
  }
  await db.collection<VariantMistake>("variantMistakes").updateMany(
    {
      userId: params.userId,
      repertoireId: params.repertoireId,
      mistakeKey: { $in: staleMistakeKeys },
      archivedAt: { $exists: false },
    },
    {
      $set: {
        archivedAt: now,
        updatedAt: now,
      },
    }
  );
};

export const getVariantMistakesForRepertoire = async (params: {
  userId: string;
  repertoireId: string;
  openingName?: string;
  dueOnly?: boolean;
  now?: Date;
}): Promise<VariantMistakeDto[]> => {
  await archiveStaleMistakesForRepertoire({
    userId: params.userId,
    repertoireId: params.repertoireId,
    openingName: params.openingName,
    now: params.now,
  });
  const db = getDB();
  const now = params.now || new Date();
  const todayKey = getUtcDayKey(now);
  const query: Record<string, unknown> = {
    userId: params.userId,
    repertoireId: params.repertoireId,
    archivedAt: { $exists: false },
  };
  if (params.openingName?.trim()) {
    query.openingName = params.openingName.trim();
  }
  if (params.dueOnly) {
    query.dueAt = { $lte: now };
    query.$or = [
      { lastReviewedDayKey: { $exists: false } },
      { lastReviewedDayKey: { $ne: todayKey } },
    ];
  }
  const mistakes = await db
    .collection<VariantMistake>("variantMistakes")
    .find(query)
    .sort({ dueAt: 1, updatedAt: -1 })
    .toArray();
  return mistakes.map((mistake) => ({
    repertoireId: mistake.repertoireId,
    variantName: mistake.variantName,
    openingName: mistake.openingName,
    orientation: mistake.orientation,
    mistakeKey: mistake.mistakeKey,
    positionFen: mistake.positionFen,
    variantStartFen: mistake.variantStartFen,
    variantStartPly: mistake.variantStartPly,
    mistakePly: mistake.mistakePly,
    expectedMoveLan: mistake.expectedMoveLan,
    expectedMoveSan: mistake.expectedMoveSan,
    seenCount: mistake.seenCount,
    solvedCount: mistake.solvedCount,
    dueAt: mistake.dueAt,
    lastReviewedAt: mistake.lastReviewedAt,
    lastReviewedDayKey: mistake.lastReviewedDayKey,
    state: mistake.state,
    stability: mistake.stability,
    difficulty: mistake.difficulty,
    reps: mistake.reps,
    lapses: mistake.lapses,
    intervalDays: mistake.intervalDays,
    ease: mistake.ease,
    lastRating: mistake.lastRating ?? null,
    createdAt: mistake.createdAt,
    updatedAt: mistake.updatedAt,
    archivedAt: mistake.archivedAt,
  }));
};

export const reviewVariantMistake = async (params: {
  userId: string;
  repertoireId: string;
  mistakeKey: string;
  rating: ReviewRating;
  now?: Date;
}): Promise<VariantMistakeDto> => {
  const db = getDB();
  const now = params.now || new Date();
  const filter = {
    userId: params.userId,
    repertoireId: params.repertoireId,
    mistakeKey: params.mistakeKey,
    archivedAt: { $exists: false },
  };
  const existing = await db.collection<VariantMistake>("variantMistakes").findOne(filter);
  if (!existing) {
    throw createNotFoundError("Mistake not found");
  }
  const schedule = computeNextSchedule(
    {
      intervalDays: existing.intervalDays,
      ease: existing.ease,
      reps: existing.reps,
      lapses: existing.lapses,
    },
    params.rating,
    now
  );
  await db.collection<VariantMistake>("variantMistakes").updateOne(filter, {
    $set: {
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
      updatedAt: now,
    },
    $inc: {
      seenCount: 1,
      solvedCount: isSolvedRating(params.rating) ? 1 : 0,
    },
  });
  const updated = await db.collection<VariantMistake>("variantMistakes").findOne(filter);
  if (!updated) {
    throw createNotFoundError("Mistake not found");
  }
  return {
    repertoireId: updated.repertoireId,
    variantName: updated.variantName,
    openingName: updated.openingName,
    orientation: updated.orientation,
    mistakeKey: updated.mistakeKey,
    positionFen: updated.positionFen,
    variantStartFen: updated.variantStartFen,
    variantStartPly: updated.variantStartPly,
    mistakePly: updated.mistakePly,
    expectedMoveLan: updated.expectedMoveLan,
    expectedMoveSan: updated.expectedMoveSan,
    seenCount: updated.seenCount,
    solvedCount: updated.solvedCount,
    dueAt: updated.dueAt,
    lastReviewedAt: updated.lastReviewedAt,
    lastReviewedDayKey: updated.lastReviewedDayKey,
    state: updated.state,
    stability: updated.stability,
    difficulty: updated.difficulty,
    reps: updated.reps,
    lapses: updated.lapses,
    intervalDays: updated.intervalDays,
    ease: updated.ease,
    lastRating: updated.lastRating ?? null,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
    archivedAt: updated.archivedAt,
  };
};
