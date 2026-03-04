import {
  getOpeningNameFromVariant,
  getVariantStartPly,
  MoveVariantNode,
  VariantStatusCounts,
} from "@chess-opening-master/common";
import { ObjectId } from "mongodb";
import { VariantInfo } from "../models/VariantInfo";
import { VariantMistake } from "../models/VariantMistake";

export type RepertoireWithMoveNodes = {
  _id: ObjectId;
  name: string;
  orientation?: "white" | "black";
  moveNodes?: unknown;
};

type TreeVariant = ReturnType<MoveVariantNode["getVariants"]>[number];

export type RepertoireVariantDescriptor = {
  variantName: string;
  openingName: string;
  length: number;
  openingFen?: string;
};

export type RepertoireVariantIndex = {
  variants: RepertoireVariantDescriptor[];
  byVariantName: Map<string, RepertoireVariantDescriptor>;
  variantLengths: Map<string, number>;
  openingFens: Map<string, string>;
};

export type OpeningAggregate = {
  variantNames: Set<string>;
  variantInfoByName: Map<string, VariantInfo>;
  variantLengths: Map<string, number>;
  mistakes: VariantMistake[];
  openingFen?: string;
};

export const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const getUtcDayKey = (date: Date): string => date.toISOString().slice(0, 10);

export const toDateOrNull = (value: unknown): Date | null => {
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

const getVariantOpeningName = (variant: TreeVariant): string => {
  const normalized = variant.name?.trim();
  if (normalized) {
    return normalized;
  }
  return getOpeningNameFromVariant(variant.fullName);
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

export const buildVariantIndex = (
  repertoire: RepertoireWithMoveNodes
): RepertoireVariantIndex => {
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

export const getDescriptorForStoredVariant = (
  variantName: string,
  variantIndex: RepertoireVariantIndex
): RepertoireVariantDescriptor | undefined => variantIndex.byVariantName.get(variantName);

export const getOrCreateOpeningAggregate = (
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

export const isDueVariant = (variant: VariantInfo, now: Date, todayKey: string): boolean => {
  if (variant.lastReviewedDayKey === todayKey) {
    return false;
  }
  const dueAt = toDateOrNull(variant.dueAt);
  if (!dueAt) {
    return true;
  }
  return dueAt <= now;
};

export const isDueMistake = (mistake: VariantMistake, now: Date, todayKey: string): boolean => {
  if (mistake.lastReviewedDayKey === todayKey) {
    return false;
  }
  return mistake.dueAt <= now;
};

export const calculateWeightedMastery = (
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

export const buildStatusCounts = (
  variantNames: Iterable<string>,
  variantInfoByName: Map<string, VariantInfo>
): VariantStatusCounts => {
  const counts: VariantStatusCounts = {
    total: 0,
    noErrors: 0,
    oneError: 0,
    twoErrors: 0,
    moreThanTwoErrors: 0,
    unresolved: 0,
  };
  for (const variantName of variantNames) {
    counts.total += 1;
    const variantInfo = variantInfoByName.get(variantName);
    if (!variantInfo) {
      counts.unresolved += 1;
      continue;
    }
    if (variantInfo.errors === 0) {
      counts.noErrors += 1;
      continue;
    }
    if (variantInfo.errors === 1) {
      counts.oneError += 1;
      continue;
    }
    if (variantInfo.errors === 2) {
      counts.twoErrors += 1;
      continue;
    }
    counts.moreThanTwoErrors += 1;
  }
  return counts;
};
