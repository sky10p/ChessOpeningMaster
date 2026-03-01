import {
  MoveVariantNode,
  TrainOpeningResponse,
  TrainOpeningVariantItem,
  TrainOverviewRepertoire,
  TrainOverviewResponse,
} from "@chess-opening-master/common";
import { ObjectId } from "mongodb";
import { getDB } from "../db/mongo";
import { VariantInfo } from "../models/VariantInfo";
import { VariantMistake } from "../models/VariantMistake";
import { archiveStaleMistakesForRepertoire } from "./variantMistakeService";

type RepertoireDocument = {
  _id: ObjectId;
  name: string;
  orientation?: "white" | "black";
  disabled?: boolean;
  moveNodes?: unknown;
};

type ReviewHistoryDocument = {
  userId: string;
  repertoireId: string;
  openingName?: string;
  variantName: string;
  reviewedAt: Date;
  wrongMoves?: number;
};

type TreeVariant = ReturnType<MoveVariantNode["getVariants"]>[number];

type RepertoireVariantIndex = {
  variants: {
    variantName: string;
    openingName: string;
    length: number;
    openingFen?: string;
  }[];
  byVariantName: Map<
    string,
    { variantName: string; openingName: string; length: number; openingFen?: string }
  >;
  variantLengths: Map<string, number>;
  openingFens: Map<string, string>;
};

type OpeningAggregate = {
  variantNames: Set<string>;
  variantInfoByName: Map<string, VariantInfo>;
  variantLengths: Map<string, number>;
  mistakes: VariantMistake[];
  openingFen?: string;
};

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const getUtcDayKey = (date: Date): string => date.toISOString().slice(0, 10);

const toDateOrNull = (value: unknown): Date | null => {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (typeof value === "object" && "$date" in (value as Record<string, unknown>)) {
    const dateValue = (value as { $date?: string }).$date;
    if (!dateValue) {
      return null;
    }
    const parsed = new Date(dateValue);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

const deriveOpeningName = (variantName: string): string => {
  const opening = variantName.split(":")[0]?.trim();
  return opening || variantName;
};

const getVariantOpeningName = (variant: TreeVariant): string => {
  const normalized = variant.name?.trim();
  if (normalized) {
    return normalized;
  }
  return deriveOpeningName(variant.fullName);
};

const getVariantStartPly = (variant: TreeVariant): number => {
  let startPly = 0;
  variant.moves.forEach((moveNode) => {
    if (
      moveNode.variantName &&
      (moveNode.variantName === variant.name || moveNode.variantName === variant.fullName)
    ) {
      startPly = moveNode.position;
    }
  });
  return Math.max(0, startPly);
};

const getVariantFenAtPly = (variant: TreeVariant, targetPly: number): string => {
  if (targetPly <= 0) {
    return START_FEN;
  }
  const targetNode = variant.moves.find((moveNode) => moveNode.position === targetPly);
  const targetMove = targetNode?.getMove() as { after?: string } | undefined;
  if (targetMove?.after && targetMove.after.trim()) {
    return targetMove.after;
  }
  return START_FEN;
};

const buildVariantIndex = (repertoire: RepertoireDocument): RepertoireVariantIndex => {
  const index: RepertoireVariantIndex = {
    variants: [],
    byVariantName: new Map(),
    variantLengths: new Map(),
    openingFens: new Map(),
  };
  if (!repertoire.moveNodes) {
    return index;
  }
  try {
    const tree = MoveVariantNode.initMoveVariantNode(repertoire.moveNodes as never);
    const variants = tree.getVariants();
    variants.forEach((variant) => {
      const variantName = variant.fullName;
      const openingName = getVariantOpeningName(variant);
      const length = Math.max(1, variant.moves.length);
      let openingFen: string | undefined;
      try {
        const startPly = getVariantStartPly(variant);
        openingFen = getVariantFenAtPly(variant, startPly);
      } catch {
        openingFen = undefined;
      }
      const descriptor = { variantName, openingName, length, openingFen };
      index.variants.push(descriptor);
      index.byVariantName.set(variantName, descriptor);
      if (!index.byVariantName.has(variant.name)) {
        index.byVariantName.set(variant.name, descriptor);
      }
      index.variantLengths.set(variantName, length);
      if (!index.openingFens.has(openingName)) {
        index.openingFens.set(openingName, openingFen || START_FEN);
      }
    });
  } catch {
    return index;
  }
  return index;
};

const matchesOpening = (
  openingName: string,
  variantName: string,
  variantOpeningName?: string
): boolean => {
  const normalizedTarget = openingName.trim().toLowerCase();
  const normalizedFromRecord = (variantOpeningName || "").trim().toLowerCase();
  if (normalizedFromRecord) {
    return normalizedFromRecord === normalizedTarget;
  }
  return deriveOpeningName(variantName).toLowerCase() === normalizedTarget;
};

const isDueVariant = (
  variant: VariantInfo,
  now: Date,
  todayKey: string
): boolean => {
  if (variant.lastReviewedDayKey === todayKey) {
    return false;
  }
  const dueAt = toDateOrNull(variant.dueAt);
  if (!dueAt) {
    return true;
  }
  return dueAt <= now;
};

const isDueMistake = (
  mistake: VariantMistake,
  now: Date,
  todayKey: string
): boolean => {
  if (mistake.lastReviewedDayKey === todayKey) {
    return false;
  }
  return mistake.dueAt <= now;
};

const calculateOpeningMastery = (
  variantNames: Iterable<string>,
  variantInfoByName: Map<string, VariantInfo>,
  variantLengths: Map<string, number>
): number => {
  let weightedScore = 0;
  let totalWeight = 0;
  for (const variantName of variantNames) {
    const variant = variantInfoByName.get(variantName);
    const mastery = variant && typeof variant.masteryScore === "number" ? variant.masteryScore : 0;
    const weight = variantLengths.get(variantName) || 1;
    weightedScore += mastery * weight;
    totalWeight += weight;
  }
  if (totalWeight === 0) {
    return 0;
  }
  return Math.round(weightedScore / totalWeight);
};

const resolveOpeningNameForVariant = (
  variantName: string,
  variantOpeningName: string | undefined,
  variantIndex: RepertoireVariantIndex
): string => {
  return (
    variantIndex.byVariantName.get(variantName)?.openingName ||
    variantOpeningName?.trim() ||
    deriveOpeningName(variantName)
  );
};

const getOrCreateOpeningAggregate = (
  openingMap: Map<string, OpeningAggregate>,
  openingName: string,
  fallbackFen?: string
): OpeningAggregate => {
  const existing = openingMap.get(openingName);
  if (existing) {
    return existing;
  }
  const created: OpeningAggregate = {
    variantNames: new Set<string>(),
    variantInfoByName: new Map<string, VariantInfo>(),
    variantLengths: new Map<string, number>(),
    mistakes: [],
    openingFen: fallbackFen,
  };
  openingMap.set(openingName, created);
  return created;
};

export const getTrainOverview = async (userId: string): Promise<TrainOverviewResponse> => {
  const db = getDB();
  const now = new Date();
  const todayKey = getUtcDayKey(now);
  const repertoires = await db
    .collection<RepertoireDocument>("repertoires")
    .find({ userId, disabled: { $ne: true } })
    .sort({ order: 1 })
    .toArray();
  if (repertoires.length === 0) {
    return { repertoires: [] };
  }
  const repertoireIds = repertoires.map((repertoire) => String(repertoire._id));
  await Promise.all(
    repertoireIds.map((repertoireId) =>
      archiveStaleMistakesForRepertoire({ userId, repertoireId, now })
    )
  );
  const variants = await db
    .collection<VariantInfo & { userId: string }>("variantsInfo")
    .find({ userId, repertoireId: { $in: repertoireIds } })
    .toArray();
  const mistakes = await db
    .collection<VariantMistake>("variantMistakes")
    .find({
      userId,
      repertoireId: { $in: repertoireIds },
      archivedAt: { $exists: false },
    })
    .toArray();
  const variantByRepertoire = new Map<string, VariantInfo[]>();
  const mistakesByRepertoire = new Map<string, VariantMistake[]>();
  variants.forEach((variant) => {
    const existing = variantByRepertoire.get(variant.repertoireId) || [];
    existing.push(variant);
    variantByRepertoire.set(variant.repertoireId, existing);
  });
  mistakes.forEach((mistake) => {
    const existing = mistakesByRepertoire.get(mistake.repertoireId) || [];
    existing.push(mistake);
    mistakesByRepertoire.set(mistake.repertoireId, existing);
  });
  const response: TrainOverviewRepertoire[] = repertoires.map((repertoire) => {
    const repertoireId = String(repertoire._id);
    const variantsForRepertoire = variantByRepertoire.get(repertoireId) || [];
    const mistakesForRepertoire = mistakesByRepertoire.get(repertoireId) || [];
    const variantIndex = buildVariantIndex(repertoire);
    const openingMap = new Map<string, OpeningAggregate>();

    variantIndex.variants.forEach((descriptor) => {
      const grouped = getOrCreateOpeningAggregate(
        openingMap,
        descriptor.openingName,
        descriptor.openingFen || variantIndex.openingFens.get(descriptor.openingName)
      );
      grouped.variantNames.add(descriptor.variantName);
      grouped.variantLengths.set(descriptor.variantName, descriptor.length);
      if (!grouped.openingFen && descriptor.openingFen) {
        grouped.openingFen = descriptor.openingFen;
      }
    });

    variantsForRepertoire.forEach((variant) => {
      const openingName = resolveOpeningNameForVariant(
        variant.variantName,
        variant.openingName,
        variantIndex
      );
      const grouped = getOrCreateOpeningAggregate(
        openingMap,
        openingName,
        variantIndex.openingFens.get(openingName)
      );
      grouped.variantNames.add(variant.variantName);
      grouped.variantInfoByName.set(variant.variantName, variant);
      if (!grouped.variantLengths.has(variant.variantName)) {
        grouped.variantLengths.set(
          variant.variantName,
          variantIndex.variantLengths.get(variant.variantName) || 1
        );
      }
    });

    mistakesForRepertoire.forEach((mistake) => {
      const openingName = resolveOpeningNameForVariant(
        mistake.variantName,
        mistake.openingName,
        variantIndex
      );
      const grouped = getOrCreateOpeningAggregate(
        openingMap,
        openingName,
        variantIndex.openingFens.get(openingName)
      );
      grouped.mistakes.push(mistake);
      if (!grouped.openingFen && variantIndex.openingFens.get(openingName)) {
        grouped.openingFen = variantIndex.openingFens.get(openingName);
      }
    });

    return {
      repertoireId,
      repertoireName: repertoire.name,
      orientation: repertoire.orientation,
      openings: Array.from(openingMap.entries())
        .map(([openingName, grouped]) => {
          let dueVariantsCount = 0;
          grouped.variantNames.forEach((variantName) => {
            const variantInfo = grouped.variantInfoByName.get(variantName);
            if (!variantInfo || isDueVariant(variantInfo, now, todayKey)) {
              dueVariantsCount += 1;
            }
          });
          return {
            repertoireId,
            repertoireName: repertoire.name,
            openingName,
            orientation: repertoire.orientation,
            openingFen: grouped.openingFen || START_FEN,
            masteryScore: calculateOpeningMastery(
              grouped.variantNames,
              grouped.variantInfoByName,
              grouped.variantLengths
            ),
            dueVariantsCount,
            dueMistakesCount: grouped.mistakes.filter((mistake) =>
              isDueMistake(mistake, now, todayKey)
            ).length,
            totalVariantsCount: grouped.variantNames.size,
          };
        })
        .sort((left, right) => left.openingName.localeCompare(right.openingName)),
    };
  });
  return { repertoires: response };
};

const loadRepertoireForUser = async (
  userId: string,
  repertoireId: string
): Promise<RepertoireDocument | null> => {
  if (!ObjectId.isValid(repertoireId)) {
    return null;
  }
  const db = getDB();
  return db.collection<RepertoireDocument>("repertoires").findOne({
    _id: new ObjectId(repertoireId),
    userId,
    disabled: { $ne: true },
  });
};

export const getTrainOpening = async (
  userId: string,
  repertoireId: string,
  openingName: string
): Promise<TrainOpeningResponse | null> => {
  const repertoire = await loadRepertoireForUser(userId, repertoireId);
  if (!repertoire) {
    return null;
  }
  const db = getDB();
  const now = new Date();
  const todayKey = getUtcDayKey(now);
  await archiveStaleMistakesForRepertoire({
    userId,
    repertoireId,
    now,
  });
  const variantIndex = buildVariantIndex(repertoire);
  const normalizedOpeningName = openingName.trim().toLowerCase();
  const canonicalOpeningName =
    Array.from(
      new Set(variantIndex.variants.map((descriptor) => descriptor.openingName))
    ).find((name) => name.toLowerCase() === normalizedOpeningName) ||
    openingName.trim();

  const variants = await db
    .collection<VariantInfo & { userId: string }>("variantsInfo")
    .find({ userId, repertoireId })
    .toArray();

  const variantInfoByName = new Map<string, VariantInfo>();
  const variantLengths = new Map<string, number>();
  const variantNameSet = new Set<string>();

  variantIndex.variants
    .filter(
      (descriptor) =>
        descriptor.openingName.trim().toLowerCase() === normalizedOpeningName
    )
    .forEach((descriptor) => {
      variantNameSet.add(descriptor.variantName);
      variantLengths.set(descriptor.variantName, descriptor.length);
    });

  variants.forEach((variant) => {
    const resolvedOpeningName = resolveOpeningNameForVariant(
      variant.variantName,
      variant.openingName,
      variantIndex
    );
    if (resolvedOpeningName.trim().toLowerCase() !== normalizedOpeningName) {
      return;
    }
    variantNameSet.add(variant.variantName);
    variantInfoByName.set(variant.variantName, variant);
    if (!variantLengths.has(variant.variantName)) {
      variantLengths.set(
        variant.variantName,
        variantIndex.variantLengths.get(variant.variantName) || 1
      );
    }
  });

  const mistakes = (
    await db
      .collection<VariantMistake>("variantMistakes")
      .find({
        userId,
        repertoireId,
        archivedAt: { $exists: false },
      })
      .sort({ dueAt: 1, updatedAt: -1 })
      .toArray()
  ).filter(
    (mistake) =>
      variantNameSet.has(mistake.variantName) ||
      matchesOpening(canonicalOpeningName, mistake.variantName, mistake.openingName)
  );

  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const recentStart = new Date(now.getTime() - sevenDaysMs);
  const previousStart = new Date(now.getTime() - sevenDaysMs * 2);
  const [recentReviews, previousReviews] = await Promise.all([
    db
      .collection<ReviewHistoryDocument>("variantReviewHistory")
      .find({
        userId,
        repertoireId,
        reviewedAt: { $gte: recentStart, $lt: now },
      })
      .toArray(),
    db
      .collection<ReviewHistoryDocument>("variantReviewHistory")
      .find({
        userId,
        repertoireId,
        reviewedAt: { $gte: previousStart, $lt: recentStart },
      })
      .toArray(),
  ]);

  const filterHistoryByOpening = (review: ReviewHistoryDocument): boolean =>
    variantNameSet.has(review.variantName) ||
    matchesOpening(canonicalOpeningName, review.variantName, review.openingName);

  const recentErrors = recentReviews
    .filter(filterHistoryByOpening)
    .reduce((sum, review) => sum + Math.max(0, Math.floor(review.wrongMoves || 0)), 0);
  const previousErrors = previousReviews
    .filter(filterHistoryByOpening)
    .reduce((sum, review) => sum + Math.max(0, Math.floor(review.wrongMoves || 0)), 0);
  const mistakesReducedLast7Days = Math.max(0, previousErrors - recentErrors);

  const variantItems: TrainOpeningVariantItem[] = Array.from(variantNameSet.values())
    .sort((left, right) => left.localeCompare(right))
    .map((variantName) => {
      const variantInfo = variantInfoByName.get(variantName);
      const itemOpeningName = resolveOpeningNameForVariant(
        variantName,
        variantInfo?.openingName,
        variantIndex
      );
      const errors = Math.max(0, Math.floor(variantInfo?.errors || 0));
      return {
        repertoireId,
        variantName,
        openingName: itemOpeningName,
        orientation: variantInfo?.orientation || repertoire.orientation,
        errors,
        dueAt: toDateOrNull(variantInfo?.dueAt || null) || undefined,
        lastReviewedDayKey: variantInfo?.lastReviewedDayKey,
        masteryScore:
          variantInfo && typeof variantInfo.masteryScore === "number"
            ? variantInfo.masteryScore
            : 0,
        perfectRunStreak:
          variantInfo && typeof variantInfo.perfectRunStreak === "number"
            ? variantInfo.perfectRunStreak
            : 0,
        dailyErrorCount:
          variantInfo && typeof variantInfo.dailyErrorCount === "number"
            ? variantInfo.dailyErrorCount
            : errors,
        lastRating: variantInfo?.lastRating ?? null,
      };
    });

  let dueVariantsCount = 0;
  variantNameSet.forEach((variantName) => {
    const variantInfo = variantInfoByName.get(variantName);
    if (!variantInfo || isDueVariant(variantInfo, now, todayKey)) {
      dueVariantsCount += 1;
    }
  });

  return {
    repertoireId,
    repertoireName: repertoire.name,
    openingName: canonicalOpeningName,
    orientation: repertoire.orientation,
    openingFen: variantIndex.openingFens.get(canonicalOpeningName) || START_FEN,
    stats: {
      masteryScore: calculateOpeningMastery(
        variantNameSet,
        variantInfoByName,
        variantLengths
      ),
      dueVariantsCount,
      dueMistakesCount: mistakes.filter((mistake) =>
        isDueMistake(mistake, now, todayKey)
      ).length,
      totalVariantsCount: variantNameSet.size,
      mistakesReducedLast7Days,
    },
    variants: variantItems,
    mistakes: mistakes.map((mistake) => ({
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
    })),
  };
};
