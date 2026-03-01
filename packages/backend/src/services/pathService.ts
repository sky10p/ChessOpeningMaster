import { getDB } from "../db/mongo";
import { VariantInfo } from "../models/VariantInfo";
import { StudySession } from "../models/Study";
import { normalizeDate } from "../utils/dateUtils";
import {
  NewVariantPath,
  Path,
  StudiedVariantPath,
  EmptyPath,
  StudyPath,
  PathCategory,
  PathSelectionFilters,
  PathPlanSummary,
  PathAnalyticsSummary,
  PathPlanPoint,
  PathForecastDay,
  PathForecastVariant,
  getOpeningNameFromVariant,
} from "@chess-opening-master/common";
import { getRepertoireName } from "./repertoireService";
import { extractId } from "../utils/idUtils";
import { Document, Filter, ObjectId } from "mongodb";
import { getAllVariants } from "./variantsService";
import { ReviewRating } from "@chess-opening-master/common";

// Type Definitions

export interface VariantInfoDocument {
  _id: string;
  repertoireId: string;
  variantName: string;
  errors: number;
  lastDate: string | Date | { $date: string };
  dueAt?: string | Date | { $date: string };
  lastReviewedDayKey?: string;
  openingName?: string;
  startingFen?: string;
  orientation?: "white" | "black";
}

export interface StudyToReview {
  groupId: string;
  studyId: string;
  name: string;
  lastSession?: string;
}

export interface StudyGroup {
  _id: string | ObjectId;
  name: string;
  studies: Array<{
    id: string;
    name: string;
    sessions?: StudySession[];
  }>;
}

interface StudyDocument {
  _id?: string | ObjectId;
  id?: string;
  name?: string;
  sessions?: StudySession[];
}

interface StudyGroupDocument extends Document {
  _id: ObjectId;
  name?: string;
  studies?: StudyDocument[];
}

interface VariantWeighted {
  variant: NewVariantPath;
  weight: number;
}

interface RepertoireWeight {
  id: string;
  weight: number;
}

export interface PathInsightsFilters extends PathSelectionFilters {
  dateFrom?: string;
  dateTo?: string;
  dailyNewLimit?: number;
}

interface ReviewHistoryDocument extends Document {
  userId: string;
  repertoireId: string;
  variantName: string;
  isFirstReview?: boolean;
  reviewedAt: Date | string | { $date: string };
  reviewedDayKey?: string;
  rating: ReviewRating;
  dueBeforeReviewAt?: Date | string | { $date: string } | null;
  openingName?: string;
  startingFen?: string;
  orientation?: "white" | "black";
}

interface ForecastDayBucket {
  dueCount: number;
  openingCounts: Map<string, number>;
  variants: StudiedVariantPath[];
}

// Variant data retrieval functions

/**
 * Retrieves active variants from the database (non-disabled variants)
 */
export const getActiveVariants = async (userId: string): Promise<VariantInfo[]> => {
  const db = getDB();

  const allVariantsInfo = await db
    .collection<VariantInfoDocument>("variantsInfo")
    .find({ userId })
    .toArray();

  const normalizedVariants = allVariantsInfo.map(normalizeVariantInfo);
  const repertoireIds = extractUniqueRepertoireIds(normalizedVariants);
  const activeRepertoireIds = await filterActiveRepertoireIds(userId, repertoireIds);

  return normalizedVariants.filter((variant) =>
    activeRepertoireIds.includes(variant.repertoireId)
  );
};

/**
 * Normalizes variant information from database format
 */
function normalizeVariantInfo(variant: VariantInfoDocument): VariantInfo {
  return {
    _id: { $oid: variant._id },
    repertoireId: variant.repertoireId,
    variantName: variant.variantName,
    errors: variant.errors,
    lastDate:
      typeof variant.lastDate === "string"
        ? new Date(variant.lastDate)
        : variant.lastDate instanceof Date
          ? variant.lastDate
          : new Date(variant.lastDate.$date),
    dueAt: variant.dueAt
      ? typeof variant.dueAt === "string"
        ? new Date(variant.dueAt)
        : variant.dueAt instanceof Date
          ? variant.dueAt
          : new Date(variant.dueAt.$date)
      : undefined,
    lastReviewedDayKey: variant.lastReviewedDayKey,
    openingName: variant.openingName,
    startingFen: variant.startingFen,
    orientation: variant.orientation,
  };
}

/**
 * Extracts unique repertoire IDs from variants
 */
function extractUniqueRepertoireIds(variants: VariantInfo[]): string[] {
  return [...new Set(variants.map((variant) => variant.repertoireId))];
}

/**
 * Filters repertoire IDs to include only active (non-disabled) ones
 */
async function filterActiveRepertoireIds(
  userId: string,
  repertoireIds: string[]
): Promise<string[]> {
  const db = getDB();

  const repertoires = await db
    .collection("repertoires")
    .find(
      { _id: { $in: repertoireIds.map((id) => new ObjectId(id)) }, userId },
      { projection: { _id: 1, disabled: 1 } }
    )
    .toArray();

  return repertoires
    .filter((rep) => !rep.disabled)
    .map((rep) => String(rep._id));
}

// Variant selection functions

/**
 * Finds the best variant to review based on error count and review date
 */
export const findVariantToReview = (
  variants: VariantInfo[]
): VariantInfo | null => {
  if (variants.length === 0) return null;

  return variants.reduce((prev: VariantInfo, curr: VariantInfo) => {
    const prevDate = normalizeDate(prev.lastDate);
    const currDate = normalizeDate(curr.lastDate);

    if (curr.errors > prev.errors) return curr;
    if (curr.errors === prev.errors) {
      return new Date(currDate) < new Date(prevDate) ? curr : prev;
    }
    return prev;
  }, variants[0]);
};

/**
 * Finds the oldest variant (least recently reviewed) from a list
 */
function findOldestVariant(variants: VariantInfo[]): VariantInfo {
  return variants.reduce((prev, curr) => {
    const prevDate = new Date(normalizeDate(prev.lastDate));
    const currDate = new Date(normalizeDate(curr.lastDate));
    return currDate < prevDate ? curr : prev;
  }, variants[0]);
}

// Study group functions

/**
 * Retrieves all study groups from the database
 */
export const getStudyGroups = async (userId: string): Promise<StudyGroup[]> => {
  const db = getDB();
  const studyDocs = await db
    .collection<StudyGroupDocument>("studies")
    .find({ userId })
    .toArray();

  return studyDocs.map(mapStudyDocToStudyGroup);
};

/**
 * Maps a study document from the database to a StudyGroup object
 */
function mapStudyDocToStudyGroup(doc: StudyGroupDocument): StudyGroup {
  return {
    _id: doc._id,
    name: doc.name || "Unnamed Study Group",
    studies: Array.isArray(doc.studies)
      ? doc.studies.map(mapStudyDocToStudy)
      : [],
  };
}

/**
 * Maps a study document to a study object with normalized fields
 */
function mapStudyDocToStudy(study: StudyDocument) {
  return {
    id: study.id || String(study._id || ""),
    name: study.name || "Unnamed Study",
    sessions: study.sessions || [],
  };
}

/**
 * Finds the best study to review based on recency
 */
export const findStudyToReview = (
  studyGroups: StudyGroup[]
): StudyToReview | null => {
  let studyToReview: StudyToReview | null = null;
  let oldestSessionDate: string | null = null;

  for (const group of studyGroups) {
    for (const study of group.studies || []) {
      if (!study.sessions || study.sessions.length === 0) {
        // Priority to studies that have never been reviewed
        return {
          groupId: String(group._id),
          studyId: study.id,
          name: study.name,
        };
      } else {
        const lastSession = findMostRecentSession(study.sessions);

        if (
          !oldestSessionDate ||
          new Date(lastSession.start) < new Date(oldestSessionDate)
        ) {
          oldestSessionDate = lastSession.start;
          studyToReview = {
            groupId: String(group._id),
            studyId: study.id,
            name: study.name,
            lastSession: lastSession.start,
          };
        }
      }
    }
  }

  return studyToReview;
};

/**
 * Finds the most recent study session
 */
function findMostRecentSession(sessions: StudySession[]): StudySession {
  return sessions.reduce(
    (prev: StudySession, curr: StudySession) =>
      new Date(curr.start) > new Date(prev.start) ? curr : prev,
    sessions[0]
  );
}

// Path creation functions

/**
 * Creates a path object for a studied variant
 */
export const createVariantPath = async (
  userId: string,
  variant: VariantInfo
): Promise<StudiedVariantPath> => {
  const variantId = extractId(variant._id);

  return {
    type: "variant",
    id: variantId,
    repertoireId: variant.repertoireId,
    repertoireName: await getRepertoireName(userId, variant.repertoireId),
    name: variant.variantName,
    errors: variant.errors,
    lastDate: variant.lastDate,
    dueAt: variant.dueAt,
    lastReviewedDayKey: variant.lastReviewedDayKey,
    lastRating: variant.lastRating ?? null,
    orientation: variant.orientation,
    openingName: variant.openingName,
    startingFen: variant.startingFen,
  };
};

/**
 * Creates a path object for a study
 */
export const createStudyPath = (study: StudyToReview): StudyPath => {
  return {
    type: "study",
    groupId: study.groupId,
    studyId: study.studyId,
    name: study.name,
    lastSession: study.lastSession || null,
  };
};

/**
 * Creates a path object for a new variant
 */
export const createNewVariantPath = async (
  userId: string,
  variant: { fullName: string },
  repertoireId: string
): Promise<NewVariantPath> => {
  return {
    type: "newVariant",
    repertoireId,
    repertoireName: await getRepertoireName(userId, repertoireId),
    name: variant.fullName,
  };
};

/**
 * Creates an empty path with a message
 */
function createEmptyPath(): EmptyPath {
  return { message: "No variants or studies to review." };
}

// Main path determination function

/**
 * Determines the best path for review based on various criteria
 */
export const determineBestPath = async (
  userId: string,
  category?: PathCategory,
  filters?: PathSelectionFilters
): Promise<Path> => {
  // Get all needed data
  const { newVariants, studiedVariants } = await getAllVariants(userId);
  const studyGroups = await getStudyGroups(userId);

  // Convert studied variants to VariantInfo array
  const activeVariants: VariantInfo[] = studiedVariants
    .filter((variant) => matchesVariantFilters(variant, filters))
    .map((variant) => ({
    _id: { $oid: variant.id },
    repertoireId: variant.repertoireId,
    variantName: variant.name,
    errors: variant.errors,
    lastDate:
      typeof variant.lastDate === "string"
        ? new Date(variant.lastDate)
        : (variant.lastDate as Date),
    dueAt:
      variant.dueAt instanceof Date
        ? variant.dueAt
        : typeof variant.dueAt === "string"
          ? new Date(variant.dueAt)
          : undefined,
    lastReviewedDayKey: variant.lastReviewedDayKey,
    lastRating: variant.lastRating ?? null,
    openingName: variant.openingName,
    startingFen: variant.startingFen,
    orientation: variant.orientation,
  }));
  const filteredNewVariants = newVariants.filter((variant) =>
    matchesVariantFilters(variant, filters)
  );

  // Define the categories of content to review
  const threeMonthsAgo = getDateThreeMonthsAgo();
  const now = new Date();
  const categories = categorizeContent(
    activeVariants,
    filteredNewVariants,
    studyGroups,
    threeMonthsAgo,
    now
  );

  // If nothing to review at all, return empty path
  if (areAllCategoriesEmpty(categories)) {
    return createEmptyPath();
  }

  if (category) {
    return await selectPathBasedOnCategory(userId, category, categories, filters);
  }
  return await selectPathDeterministically(
    userId,
    categories.variantsWithErrors,
    categories.newVariants,
    categories.dueVariants,
    categories.oldVariants,
    categories.studyToReview,
    filters
  );
};

/**
 * Gets a date that was three months ago from now
 */
function getDateThreeMonthsAgo(): Date {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  return threeMonthsAgo;
}

/**
 * Categorizes content into different review categories
 */
function categorizeContent(
  activeVariants: VariantInfo[],
  newVariants: NewVariantPath[],
  studyGroups: StudyGroup[],
  threeMonthsAgo: Date,
  now: Date
) {
  const eligibleVariants = activeVariants.filter(
    (variant) => isVariantDueForPathSelection(variant, now) && !wasReviewedToday(variant, now)
  );
  // Group variants with errors
  const variantsWithErrors = eligibleVariants.filter((v) => v.errors > 0);

  // Find old variants (not reviewed in >3 months)
  const oldVariants = eligibleVariants.filter((variant) => {
    const lastReviewDate = new Date(normalizeDate(variant.lastDate));
    return lastReviewDate < threeMonthsAgo && variant.errors === 0;
  });
  const dueVariants = eligibleVariants.filter((variant) => variant.errors === 0);

  // Find studies to review
  const studyToReview = findStudyToReview(studyGroups);

  return {
    variantsWithErrors,
    oldVariants,
    dueVariants,
    newVariants,
    studyToReview,
    hasVariantsWithErrors: variantsWithErrors.length > 0,
    hasNewVariants: newVariants.length > 0,
    hasOldVariants: oldVariants.length > 0,
    hasStudyToReview: studyToReview !== null,
  };
}

function matchesVariantFilters(
  variant: {
    name?: string;
    variantName?: string;
    openingName?: string;
    startingFen?: string;
    orientation?: "white" | "black";
  },
  filters?: PathSelectionFilters
): boolean {
  if (!filters) {
    return true;
  }
  const openingName = filters.openingName?.trim().toLowerCase();
  const fen = filters.fen?.trim().toLowerCase();
  if (filters.orientation && variant.orientation !== filters.orientation) {
    return false;
  }
  if (openingName) {
    const candidateOpeningName = (variant.openingName || variant.variantName || variant.name || "").toLowerCase();
    if (!candidateOpeningName.includes(openingName)) {
      return false;
    }
  }
  if (fen) {
    const candidateFen = (variant.startingFen || "").toLowerCase();
    if (!candidateFen.includes(fen)) {
      return false;
    }
  }
  return true;
}

function getUtcDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function toDateOrNull(value: unknown): Date | null {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === "string") {
    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }
  if (typeof value === "object" && "$date" in (value as Record<string, unknown>)) {
    const dateValue = (value as { $date: string }).$date;
    const parsedDate = new Date(dateValue);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }
  return null;
}

function wasReviewedToday(
  variant: { lastReviewedDayKey?: string; lastDate: unknown },
  now: Date
): boolean {
  const todayKey = getUtcDayKey(now);
  if (variant.lastReviewedDayKey) {
    return variant.lastReviewedDayKey === todayKey;
  }
  const lastDate = toDateOrNull(variant.lastDate);
  if (!lastDate) {
    return false;
  }
  return getUtcDayKey(lastDate) === todayKey;
}

function isVariantDueForPathSelection(
  variant: { suspendedUntil?: unknown; dueAt?: unknown },
  now: Date
): boolean {
  if (variant.suspendedUntil) {
    const suspendedUntilDate = toDateOrNull(variant.suspendedUntil);
    if (suspendedUntilDate && suspendedUntilDate > now) {
      return false;
    }
  }
  if (!variant.dueAt) {
    return true;
  }
  const dueAtDate = toDateOrNull(variant.dueAt);
  if (!dueAtDate) {
    return true;
  }
  return dueAtDate <= now;
}

/**
 * Checks if all content categories are empty
 */
function areAllCategoriesEmpty(categories: {
  hasVariantsWithErrors: boolean;
  hasNewVariants: boolean;
  hasOldVariants: boolean;
  hasStudyToReview: boolean;
}): boolean {
  return (
    !categories.hasVariantsWithErrors &&
    !categories.hasNewVariants &&
    !categories.hasOldVariants &&
    !categories.hasStudyToReview
  );
}

/**
 * Selects a path based on the specified category
 */
async function selectPathBasedOnCategory(
  userId: string,
  category: string,
  categories: {
    variantsWithErrors: VariantInfo[];
    newVariants: NewVariantPath[];
    oldVariants: VariantInfo[];
    dueVariants: VariantInfo[];
    studyToReview: StudyToReview | null;
  },
  filters?: PathSelectionFilters
): Promise<Path> {
  switch (category) {
    case "variantsWithErrors": {
      if (categories.variantsWithErrors.length === 0) {
        return createEmptyPath();
      }
      const variantToReview = findVariantToReview(
        categories.variantsWithErrors
      );
      if (!variantToReview) {
        return createEmptyPath();
      }
      return await createVariantPath(userId, variantToReview);
    }
    case "newVariants": {
      if (categories.newVariants.length === 0) {
        return createEmptyPath();
      }
      return selectNewVariant(categories.newVariants);
    }
    case "oldVariants": {
      if (categories.oldVariants.length === 0) {
        return createEmptyPath();
      }
      return await createVariantPath(userId, findOldestVariant(categories.oldVariants));
    }
    case "studyToReview": {
      if (hasAnyVariantFilter(filters)) {
        return createEmptyPath();
      }
      if (!categories.studyToReview) {
        return createEmptyPath();
      }
      return createStudyPath(categories.studyToReview);
    }
    default:
      throw new Error("Invalid category specified");
  }
}

function findEarliestDueVariant(variants: VariantInfo[]): VariantInfo {
  return variants.reduce((prev, curr) => {
    const prevDueAt = toDateOrNull(prev.dueAt) || new Date(normalizeDate(prev.lastDate));
    const currDueAt = toDateOrNull(curr.dueAt) || new Date(normalizeDate(curr.lastDate));
    if (currDueAt.getTime() === prevDueAt.getTime()) {
      const prevDate = new Date(normalizeDate(prev.lastDate));
      const currDate = new Date(normalizeDate(curr.lastDate));
      return currDate < prevDate ? curr : prev;
    }
    return currDueAt < prevDueAt ? curr : prev;
  }, variants[0]);
}

async function selectPathDeterministically(
  userId: string,
  variantsWithErrors: VariantInfo[],
  newVariants: NewVariantPath[],
  dueVariants: VariantInfo[],
  oldVariants: VariantInfo[],
  studyToReview: StudyToReview | null,
  filters?: PathSelectionFilters
): Promise<Path> {
  if (variantsWithErrors.length > 0) {
    const selectedVariant = findVariantWithMostErrors(variantsWithErrors);
    return createVariantPath(userId, selectedVariant);
  }
  if (dueVariants.length > 0) {
    const dueVariant = findEarliestDueVariant(dueVariants);
    return createVariantPath(userId, dueVariant);
  }
  if (newVariants.length > 0) {
    return selectNewVariant(newVariants);
  }
  if (oldVariants.length > 0) {
    const oldestVariant = findOldestVariant(oldVariants);
    return createVariantPath(userId, oldestVariant);
  }
  if (studyToReview && !hasAnyVariantFilter(filters)) {
    return createStudyPath(studyToReview);
  }
  return createEmptyPath();
}

function hasAnyVariantFilter(filters?: PathSelectionFilters): boolean {
  if (!filters) {
    return false;
  }
  return Boolean(filters.orientation || filters.openingName || filters.fen);
}

function toSafeNonNegativeInt(value: number | undefined, fallback: number): number {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(0, Math.floor(value as number));
}

function toUtcMidnight(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addUtcDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function parseDateOnly(value: string | undefined, fallback: Date): Date {
  if (!value) {
    return fallback;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return fallback;
  }
  return toUtcMidnight(parsed);
}

function getReviewDayKey(review: ReviewHistoryDocument): string {
  if (review.reviewedDayKey) {
    return review.reviewedDayKey;
  }
  const reviewedAt = toDateOrNull(review.reviewedAt) || new Date();
  return getUtcDayKey(reviewedAt);
}

function sortTopNamedCount(
  entries: Array<{ name: string; count: number }>,
  limit: number
): Array<{ name: string; count: number }> {
  return entries
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.name.localeCompare(b.name);
    })
    .slice(0, limit);
}

function sortTopFenCount(
  entries: Array<{ fen: string; count: number }>,
  limit: number
): Array<{ fen: string; count: number }> {
  return entries
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.fen.localeCompare(b.fen);
    })
    .slice(0, limit);
}

function resolveRawDueDay(
  variant: { dueAt?: unknown; lastDate?: unknown },
  fallbackDay: Date
): Date {
  const dueDate = toDateOrNull(variant.dueAt);
  if (dueDate) {
    return toUtcMidnight(dueDate);
  }
  const lastDate = toDateOrNull(variant.lastDate);
  if (lastDate) {
    return toUtcMidnight(lastDate);
  }
  return toUtcMidnight(fallbackDay);
}

function resolveForecastDueDay(
  variant: { dueAt?: unknown; lastDate?: unknown },
  today: Date
): Date {
  const dueDay = resolveRawDueDay(variant, today);
  if (dueDay < today) {
    return today;
  }
  return dueDay;
}

function mapToForecastVariant(
  variant: StudiedVariantPath,
  dueDay: Date
): PathForecastVariant {
  return {
    variantName: variant.name,
    repertoireId: variant.repertoireId,
    repertoireName: variant.repertoireName,
    dueDate: getUtcDayKey(dueDay),
    openingName: (variant.openingName || getOpeningNameFromVariant(variant.name)).trim(),
    orientation: variant.orientation,
    errors: variant.errors,
  };
}

function sortDueVariantCandidates(
  left: StudiedVariantPath,
  right: StudiedVariantPath,
  today: Date
): number {
  const leftDueDay = resolveRawDueDay(left, today);
  const rightDueDay = resolveRawDueDay(right, today);
  if (leftDueDay.getTime() !== rightDueDay.getTime()) {
    return leftDueDay.getTime() - rightDueDay.getTime();
  }
  if (right.errors !== left.errors) {
    return right.errors - left.errors;
  }
  const leftLastDate = toDateOrNull(left.lastDate) || today;
  const rightLastDate = toDateOrNull(right.lastDate) || today;
  return leftLastDate.getTime() - rightLastDate.getTime();
}

function buildForecastDays(
  dueVariants: StudiedVariantPath[],
  today: Date,
  horizonDays: number
): PathForecastDay[] {
  const dayBuckets = new Map<string, ForecastDayBucket>();
  for (let offset = 0; offset < horizonDays; offset += 1) {
    const day = addUtcDays(today, offset);
    dayBuckets.set(getUtcDayKey(day), {
      dueCount: 0,
      openingCounts: new Map<string, number>(),
      variants: [],
    });
  }
  for (const variant of dueVariants) {
    const dueDay = resolveForecastDueDay(variant, today);
    const dueDayKey = getUtcDayKey(dueDay);
    if (!dayBuckets.has(dueDayKey)) {
      continue;
    }
    const bucket = dayBuckets.get(dueDayKey);
    if (!bucket) {
      continue;
    }
    bucket.dueCount += 1;
    const openingName = (variant.openingName || getOpeningNameFromVariant(variant.name)).trim();
    bucket.openingCounts.set(openingName, (bucket.openingCounts.get(openingName) || 0) + 1);
    if (bucket.variants.length < 4) {
      bucket.variants.push(variant);
    }
  }
  return Array.from(dayBuckets.entries()).map(([date, bucket]) => ({
    date,
    dueCount: bucket.dueCount,
    topOpenings: sortTopNamedCount(
      Array.from(bucket.openingCounts.entries()).map(([name, count]) => ({ name, count })),
      2
    ),
    variants: bucket.variants.map((variant) =>
      mapToForecastVariant(variant, resolveForecastDueDay(variant, today))
    ),
  }));
}

export const getPathPlan = async (
  userId: string,
  filters?: PathInsightsFilters
): Promise<PathPlanSummary> => {
  const db = getDB();
  const now = new Date();
  const today = toUtcMidnight(now);
  const todayKey = getUtcDayKey(today);
  const dailyNewLimit = toSafeNonNegativeInt(filters?.dailyNewLimit, 5);
  const { newVariants, studiedVariants } = await getAllVariants(userId);
  const filteredNewVariants = newVariants.filter((variant) =>
    matchesVariantFilters(variant, filters)
  );
  const filteredStudiedVariants = studiedVariants.filter((variant) =>
    matchesVariantFilters(variant, filters)
  );
  const forecastHorizonEnd = addUtcDays(today, 13);
  const forecastEligibleVariants = filteredStudiedVariants
    .filter((variant) => {
      const forecastDueDay = resolveForecastDueDay(variant, today);
      return forecastDueDay <= forecastHorizonEnd;
    })
    .sort((left, right) => sortDueVariantCandidates(left, right, today));
  const dueEligibleVariants = filteredStudiedVariants
    .filter(
      (variant) => isVariantDueForPathSelection(variant, now) && !wasReviewedToday(variant, now)
    )
    .sort((left, right) => sortDueVariantCandidates(left, right, today));
  let overdueCount = 0;
  let dueTodayCount = 0;
  const upcomingCountMap = new Map<string, number>();
  for (const variant of dueEligibleVariants) {
    const dueDay = resolveRawDueDay(variant, today);
    const dueDayKey = getUtcDayKey(dueDay);
    if (dueDay < today) {
      overdueCount += 1;
    } else if (dueDayKey === todayKey) {
      dueTodayCount += 1;
    }
  }
  for (let dayOffset = 1; dayOffset <= 14; dayOffset += 1) {
    const day = addUtcDays(today, dayOffset);
    upcomingCountMap.set(getUtcDayKey(day), 0);
  }
  for (const variant of filteredStudiedVariants) {
    const dueDate = toDateOrNull(variant.dueAt);
    if (!dueDate) {
      continue;
    }
    const dueDayKey = getUtcDayKey(toUtcMidnight(dueDate));
    if (upcomingCountMap.has(dueDayKey)) {
      upcomingCountMap.set(dueDayKey, (upcomingCountMap.get(dueDayKey) || 0) + 1);
    }
  }
  const tomorrow = addUtcDays(today, 1);
  const todayReviewQuery: Filter<ReviewHistoryDocument> = {
    userId,
    reviewedAt: {
      $gte: today,
      $lt: tomorrow,
    },
  };
  if (filters?.orientation) {
    todayReviewQuery.orientation = filters.orientation;
  }
  const openingNameFilter = filters?.openingName?.trim();
  if (openingNameFilter) {
    const openingRegex = new RegExp(escapeRegex(openingNameFilter), "i");
    todayReviewQuery.$or = [
      { openingName: { $regex: openingRegex } },
      { variantName: { $regex: openingRegex } },
    ];
  }
  const fenFilter = filters?.fen?.trim();
  if (fenFilter) {
    todayReviewQuery.startingFen = { $regex: new RegExp(escapeRegex(fenFilter), "i") };
  }
  const reviewsToday = await db
    .collection<ReviewHistoryDocument>("variantReviewHistory")
    .find(todayReviewQuery)
    .toArray();

  const completedNewToday = reviewsToday.filter((review) => {
    if (typeof review.isFirstReview === "boolean") {
      return review.isFirstReview;
    }
    return toDateOrNull(review.dueBeforeReviewAt) === null;
  }).length;
  const completedDueToday = reviewsToday.length - completedNewToday;
  const completedTodayCount = completedDueToday + completedNewToday;
  const reviewDueCount = overdueCount + dueTodayCount;
  const suggestedNewToday = Math.min(dailyNewLimit, filteredNewVariants.length);
  const upcoming: PathPlanPoint[] = Array.from(upcomingCountMap.entries()).map(
    ([date, dueCount]) => ({
      date,
      dueCount,
    })
  );
  const nextVariants = dueEligibleVariants
    .slice(0, 12)
    .map((variant) => mapToForecastVariant(variant, resolveForecastDueDay(variant, today)));
  const openingCounts = new Map<string, number>();
  for (const variant of dueEligibleVariants) {
    const openingName = (variant.openingName || getOpeningNameFromVariant(variant.name)).trim();
    openingCounts.set(openingName, (openingCounts.get(openingName) || 0) + 1);
  }
  const upcomingOpenings = sortTopNamedCount(
    Array.from(openingCounts.entries()).map(([name, count]) => ({ name, count })),
    6
  );
  const forecastDays = buildForecastDays(forecastEligibleVariants, today, 14);
  return {
    todayKey,
    overdueCount,
    dueTodayCount,
    reviewDueCount,
    completedTodayCount,
    completedDueToday,
    completedNewToday,
    newVariantsAvailable: filteredNewVariants.length,
    suggestedNewToday,
    estimatedTodayTotal: reviewDueCount + suggestedNewToday,
    upcoming,
    forecastDays,
    nextVariants,
    upcomingOpenings,
  };
};

export const getPathAnalytics = async (
  userId: string,
  filters?: PathInsightsFilters
): Promise<PathAnalyticsSummary> => {
  const db = getDB();
  const now = new Date();
  const defaultEnd = toUtcMidnight(now);
  const defaultStart = addUtcDays(defaultEnd, -29);
  const rangeStart = parseDateOnly(filters?.dateFrom, defaultStart);
  const rangeEnd = parseDateOnly(filters?.dateTo, defaultEnd);
  const rangeEndExclusive = addUtcDays(rangeEnd, 1);
  const reviewQuery: Filter<ReviewHistoryDocument> = {
    userId,
    reviewedAt: {
      $gte: rangeStart,
      $lt: rangeEndExclusive,
    },
  };
  if (filters?.orientation) {
    reviewQuery.orientation = filters.orientation;
  }
  const openingName = filters?.openingName?.trim();
  if (openingName) {
    const openingRegex = new RegExp(escapeRegex(openingName), "i");
    reviewQuery.$or = [
      { openingName: { $regex: openingRegex } },
      { variantName: { $regex: openingRegex } },
    ];
  }
  const fen = filters?.fen?.trim();
  if (fen) {
    reviewQuery.startingFen = { $regex: new RegExp(escapeRegex(fen), "i") };
  }
  const filteredReviews = await db
    .collection<ReviewHistoryDocument>("variantReviewHistory")
    .find(reviewQuery)
    .toArray();
  const ratingBreakdown: Record<ReviewRating, number> = {
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  };
  const dailyReviewMap = new Map<string, number>();
  const openingMap = new Map<string, number>();
  const fenMap = new Map<string, number>();
  for (let day = new Date(rangeStart); day <= rangeEnd; day = addUtcDays(day, 1)) {
    dailyReviewMap.set(getUtcDayKey(day), 0);
  }
  for (const review of filteredReviews) {
    if (review.rating in ratingBreakdown) {
      ratingBreakdown[review.rating] += 1;
    }
    const reviewDayKey = getReviewDayKey(review);
    if (dailyReviewMap.has(reviewDayKey)) {
      dailyReviewMap.set(reviewDayKey, (dailyReviewMap.get(reviewDayKey) || 0) + 1);
    }
    const openingName = (review.openingName || review.variantName || "Unknown").trim();
    openingMap.set(openingName, (openingMap.get(openingName) || 0) + 1);
    if (review.startingFen && review.startingFen.trim()) {
      const fen = review.startingFen.trim();
      fenMap.set(fen, (fenMap.get(fen) || 0) + 1);
    }
  }
  return {
    rangeStart: getUtcDayKey(rangeStart),
    rangeEnd: getUtcDayKey(rangeEnd),
    totalReviews: filteredReviews.length,
    ratingBreakdown,
    dailyReviews: Array.from(dailyReviewMap.entries()).map(([date, count]) => ({
      date,
      count,
    })),
    topOpenings: sortTopNamedCount(
      Array.from(openingMap.entries()).map(([name, count]) => ({ name, count })),
      5
    ),
    topFens: sortTopFenCount(
      Array.from(fenMap.entries()).map(([fen, count]) => ({ fen, count })),
      5
    ),
  };
};

/**
 * Finds the variant with the most errors, or if tied, the oldest one
 */
function findVariantWithMostErrors(variants: VariantInfo[]): VariantInfo {
  return variants.reduce((prev, curr) => {
    if (curr.errors > prev.errors) return curr;
    if (curr.errors === prev.errors) {
      const prevDate = new Date(normalizeDate(prev.lastDate));
      const currDate = new Date(normalizeDate(curr.lastDate));
      return currDate < prevDate ? curr : prev;
    }
    return prev;
  }, variants[0]);
}

/**
 * Selects a new variant using a weighted algorithm to ensure variety
 */
function selectNewVariant(newVariants: NewVariantPath[]): NewVariantPath {
  if (newVariants.length === 0) {
    throw new Error("No new variants available to select");
  }

  if (newVariants.length === 1) {
    return newVariants[0];
  }

  // Group variants by repertoire
  const variantsByRepertoire = groupVariantsByRepertoire(newVariants);

  // Select repertoire with weighting (inverse to variant count)
  const selectedRepertoireId =
    selectRepertoireWithWeighting(variantsByRepertoire);

  // Select variant from the chosen repertoire
  return selectVariantFromRepertoire(
    variantsByRepertoire,
    selectedRepertoireId
  );
}

/**
 * Groups variants by their repertoire ID
 */
function groupVariantsByRepertoire(
  variants: NewVariantPath[]
): Map<string, NewVariantPath[]> {
  const variantsByRepertoire = new Map<string, NewVariantPath[]>();

  for (const variant of variants) {
    if (!variantsByRepertoire.has(variant.repertoireId)) {
      variantsByRepertoire.set(variant.repertoireId, []);
    }
    variantsByRepertoire.get(variant.repertoireId)?.push(variant);
  }

  return variantsByRepertoire;
}

/**
 * Selects a repertoire using weighted random selection
 */
function selectRepertoireWithWeighting(
  variantsByRepertoire: Map<string, NewVariantPath[]>
): string {
  const repertoireIds = Array.from(variantsByRepertoire.keys());

  // Weight repertoires inversely by the number of variants they have
  const repertoireWeights: RepertoireWeight[] = repertoireIds.map((id) => {
    const variants = variantsByRepertoire.get(id);
    const count = variants ? variants.length : 1;
    return { id, weight: 1 / count }; // Fewer variants = higher weight
  });

  return weightedRandomSelection(
    repertoireWeights,
    (item) => item.id,
    (item) => item.weight
  );
}

/**
 * Selects a variant from a specific repertoire using weighted selection
 */
function selectVariantFromRepertoire(
  variantsByRepertoire: Map<string, NewVariantPath[]>,
  repertoireId: string
): NewVariantPath {
  const variants = variantsByRepertoire.get(repertoireId);

  if (!variants || variants.length === 0) {
    // This shouldn't happen based on our logic, but just in case
    // Find the first repertoire with variants
    for (const [, variantList] of variantsByRepertoire.entries()) {
      if (variantList && variantList.length > 0) {
        return variantList[0];
      }
    }

    throw new Error("No variants available in any repertoire");
  }

  // Weight variants by name length as a proxy for complexity
  const variantWeights: VariantWeighted[] = variants.map((variant) => ({
    variant,
    weight: Math.min(variant.name.length / 10, 2), // Cap weight at 2
  }));

  return weightedRandomSelection(
    variantWeights,
    (item) => item.variant,
    (item) => item.weight
  );
}

/**
 * Generic weighted random selection function
 */
function weightedRandomSelection<T, R>(
  items: T[],
  extractItem: (item: T) => R,
  extractWeight: (item: T) => number
): R {
  const totalWeight = items.reduce((sum, item) => sum + extractWeight(item), 0);
  let random = Math.random() * totalWeight;

  for (const item of items) {
    random -= extractWeight(item);
    if (random <= 0) {
      return extractItem(item);
    }
  }

  // Fallback to first item (shouldn't reach here if weights are positive)
  return extractItem(items[0]);
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
