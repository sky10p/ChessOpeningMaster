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
} from "@chess-opening-master/common/src/types/Path";
import { getRepertoireName } from "./repertoireService";
import { extractId } from "../utils/idUtils";
import { Document, ObjectId } from "mongodb";
import { getAllVariants } from "./variantsService";
import { Variant } from "@chess-opening-master/common";

// Type Definitions

export interface VariantInfoDocument {
  _id: string;
  repertoireId: string;
  variantName: string;
  errors: number;
  lastDate: string | { $date: string };
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

// Constants for path selection probabilities
const PROBABILITIES = {
  ERROR_VARIANT_THRESHOLD: 60, // 0-60%
  NEW_VARIANT_THRESHOLD: 90, // 60-90%
  OLD_VARIANT_THRESHOLD: 95, // 90-95%
  // STUDY_REVIEW_THRESHOLD would be 100 (95-100%)
};

// Variant data retrieval functions

/**
 * Retrieves active variants from the database (non-disabled variants)
 */
export const getActiveVariants = async (): Promise<VariantInfo[]> => {
  const db = getDB();

  const allVariantsInfo = await db
    .collection<VariantInfoDocument>("variantsInfo")
    .find({})
    .toArray();

  const normalizedVariants = allVariantsInfo.map(normalizeVariantInfo);
  const repertoireIds = extractUniqueRepertoireIds(normalizedVariants);
  const activeRepertoireIds = await filterActiveRepertoireIds(repertoireIds);

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
        : new Date(variant.lastDate.$date),
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
  repertoireIds: string[]
): Promise<string[]> {
  const db = getDB();

  const repertoires = await db
    .collection("repertoires")
    .find(
      { _id: { $in: repertoireIds.map((id) => new ObjectId(id)) } },
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
export const getStudyGroups = async (): Promise<StudyGroup[]> => {
  const db = getDB();
  const studyDocs = await db
    .collection<StudyGroupDocument>("studies")
    .find({})
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
  variant: VariantInfo
): Promise<StudiedVariantPath> => {
  const variantId = extractId(variant._id);

  return {
    type: "variant",
    id: variantId,
    repertoireId: variant.repertoireId,
    repertoireName: await getRepertoireName(variant.repertoireId),
    name: variant.variantName,
    errors: variant.errors,
    lastDate: variant.lastDate,
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
  variant: Variant,
  repertoireId: string
): Promise<NewVariantPath> => {
  return {
    type: "newVariant",
    repertoireId,
    repertoireName: await getRepertoireName(repertoireId),
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
  category?: PathCategory
): Promise<Path> => {
  // Get all needed data
  const { newVariants, studiedVariants } = await getAllVariants();
  const studyGroups = await getStudyGroups();

  // Convert studied variants to VariantInfo array
  const activeVariants: VariantInfo[] = studiedVariants.map((variant) => ({
    _id: { $oid: variant.id },
    repertoireId: variant.repertoireId,
    variantName: variant.name,
    errors: variant.errors,
    lastDate:
      typeof variant.lastDate === "string"
        ? new Date(variant.lastDate)
        : (variant.lastDate as Date),
  }));

  // Define the categories of content to review
  const threeMonthsAgo = getDateThreeMonthsAgo();
  const categories = categorizeContent(
    activeVariants,
    newVariants,
    studyGroups,
    threeMonthsAgo
  );

  // If nothing to review at all, return empty path
  if (areAllCategoriesEmpty(categories)) {
    return createEmptyPath();
  }

  // Choose a path with probabilistic selection
  const randomValue = Math.random() * 100;

  if (category) {
    return await selectPathBasedOnCategory(category, categories);
  }

  // Apply selection logic based on probabilities and availability
  return await selectPathBasedOnProbability(
    randomValue,
    categories.variantsWithErrors,
    categories.newVariants,
    categories.oldVariants,
    categories.studyToReview
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
  threeMonthsAgo: Date
) {
  // Group variants with errors
  const variantsWithErrors = activeVariants.filter((v) => v.errors > 0);

  // Find old variants (not reviewed in >3 months)
  const oldVariants = activeVariants.filter((variant) => {
    const lastReviewDate = new Date(normalizeDate(variant.lastDate));
    return lastReviewDate < threeMonthsAgo && variant.errors === 0;
  });

  // Find studies to review
  const studyToReview = findStudyToReview(studyGroups);

  return {
    variantsWithErrors,
    oldVariants,
    newVariants,
    studyToReview,
    hasVariantsWithErrors: variantsWithErrors.length > 0,
    hasNewVariants: newVariants.length > 0,
    hasOldVariants: oldVariants.length > 0,
    hasStudyToReview: studyToReview !== null,
  };
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
  category: string,
  categories: {
    variantsWithErrors: VariantInfo[];
    newVariants: NewVariantPath[];
    oldVariants: VariantInfo[];
    studyToReview: StudyToReview | null;
  }
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
      return await createVariantPath(variantToReview);
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
      return await createVariantPath(findOldestVariant(categories.oldVariants));
    }
    case "studyToReview": {
      if (!categories.studyToReview) {
        return createEmptyPath();
      }
      return createStudyPath(categories.studyToReview);
    }
    default:
      throw new Error("Invalid category specified");
  }
}

/**
 * Selects a path based on probability thresholds and available content
 */
async function selectPathBasedOnProbability(
  randomValue: number,
  variantsWithErrors: VariantInfo[],
  newVariants: NewVariantPath[],
  oldVariants: VariantInfo[],
  studyToReview: StudyToReview | null
): Promise<Path> {
  const {
    ERROR_VARIANT_THRESHOLD,
    NEW_VARIANT_THRESHOLD,
    OLD_VARIANT_THRESHOLD,
  } = PROBABILITIES;

  // 60% - Select a variant with errors
  if (randomValue < ERROR_VARIANT_THRESHOLD && variantsWithErrors.length > 0) {
    const selectedVariant = findVariantWithMostErrors(variantsWithErrors);
    return await createVariantPath(selectedVariant);
  }

  // 30% - Select a new variant
  if (randomValue < NEW_VARIANT_THRESHOLD && newVariants.length > 0) {
    return selectNewVariant(newVariants);
  }

  // 5% - Select an old variant (>3 months without review)
  if (
    randomValue < OLD_VARIANT_THRESHOLD &&
    oldVariants.length > 0 &&
    variantsWithErrors.length === 0
  ) {
    const oldestVariant = findOldestVariant(oldVariants);
    return await createVariantPath(oldestVariant);
  }

  // 5% - Select a study to review
  if (studyToReview) {
    return createStudyPath(studyToReview);
  }

  // Fallback logic if the random selection doesn't find a match
  return await fallbackPathSelection(
    variantsWithErrors,
    newVariants,
    oldVariants,
    studyToReview
  );
}

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
 * Fallback selection when probabilistic selection fails
 */
async function fallbackPathSelection(
  variantsWithErrors: VariantInfo[],
  newVariants: NewVariantPath[],
  oldVariants: VariantInfo[],
  studyToReview: StudyToReview | null
): Promise<Path> {
  // Try each category in priority order
  if (variantsWithErrors.length > 0) {
    const selectedVariant = findVariantWithMostErrors(variantsWithErrors);
    return await createVariantPath(selectedVariant);
  }

  if (newVariants.length > 0) {
    return selectNewVariant(newVariants);
  }

  if (oldVariants.length > 0 && variantsWithErrors.length === 0) {
    const oldestVariant = findOldestVariant(oldVariants);
    return await createVariantPath(oldestVariant);
  }

  if (studyToReview) {
    return createStudyPath(studyToReview);
  }

  return createEmptyPath();
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
