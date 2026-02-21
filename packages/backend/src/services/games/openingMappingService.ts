import { BoardOrientation, OpeningMapping } from "@chess-opening-master/common";
import { ImportBatchCache } from "./gameImportTypes";
import { getBestVariantMatch, getRepertoireMetadataById } from "./repertoireMetadataService";

export const nameSimilarity = (a: string, b: string): number => {
  const al = a.toLowerCase();
  const bl = b.toLowerCase();
  if (!al || !bl) {
    return 0;
  }
  if (al === bl) {
    return 1;
  }
  if (al.includes(bl) || bl.includes(al)) {
    return 0.82;
  }
  const aTokens = new Set(al.split(/\s+/));
  const bTokens = new Set(bl.split(/\s+/));
  let overlap = 0;
  aTokens.forEach((token) => {
    if (bTokens.has(token)) {
      overlap += 1;
    }
  });
  return overlap / Math.max(aTokens.size, bTokens.size, 1);
};

export async function buildOpeningMapping(
  userId: string,
  orientation: BoardOrientation | undefined,
  openingName: string | undefined,
  eco: string | undefined,
  lineMovesSan: string[],
  tags?: string[],
  importBatchCache?: ImportBatchCache
): Promise<OpeningMapping> {
  const repertoireMetadataById = await getRepertoireMetadataById(userId, orientation, importBatchCache);
  let best: OpeningMapping = { confidence: 0, strategy: "none", requiresManualReview: true };

  repertoireMetadataById.forEach((metadata, repertoireId) => {
    const repName = metadata.repertoireName || "";
    const bestVariantByLine = getBestVariantMatch(metadata.variants, lineMovesSan);
    const bestVariantByName = metadata
      ? metadata.variants
        .map((variant) => ({
          variant,
          similarity: Math.max(nameSimilarity(openingName || "", variant.name), nameSimilarity(openingName || "", variant.fullName)),
        }))
        .sort((a, b) => b.similarity - a.similarity)[0]
      : undefined;

    if (eco && repName.toLowerCase().includes(eco.toLowerCase())) {
      const candidate: OpeningMapping = {
        repertoireId,
        repertoireName: repName,
        ...(bestVariantByLine?.variant.fullName ? { variantName: bestVariantByLine.variant.fullName } : {}),
        confidence: 0.92,
        strategy: "eco",
        requiresManualReview: false,
      };
      if (candidate.confidence > best.confidence) {
        best = candidate;
      }
    }
    if (bestVariantByLine && bestVariantByLine.ratio > best.confidence) {
      const ratio = bestVariantByLine.ratio;
      if (ratio > best.confidence) {
        best = {
          repertoireId,
          repertoireName: repName,
          variantName: bestVariantByLine.variant.fullName,
          confidence: ratio,
          strategy: "movePrefix",
          requiresManualReview: ratio < 0.75,
        };
      }
    }
    const fuzzy = nameSimilarity(openingName || "", repName);
    const variantFuzzy = bestVariantByName?.similarity || 0;
    if (Math.max(fuzzy, variantFuzzy) > best.confidence) {
      const confidence = Math.max(fuzzy, variantFuzzy);
      best = {
        repertoireId,
        repertoireName: repName,
        ...(bestVariantByName?.variant.fullName ? { variantName: bestVariantByName.variant.fullName } : {}),
        confidence,
        strategy: "fuzzyName",
        requiresManualReview: confidence < 0.75,
      };
    }
    const tagScore = tags?.some((tag) => repName.toLowerCase().includes(tag.toLowerCase())) ? 0.76 : 0;
    if (tagScore > best.confidence) {
      best = {
        repertoireId,
        repertoireName: repName,
        ...(bestVariantByLine?.variant.fullName ? { variantName: bestVariantByLine.variant.fullName } : {}),
        confidence: tagScore,
        strategy: "tagOverlap",
        requiresManualReview: false,
      };
    }
  });
  if (best.confidence < 0.75) {
    return { ...best, requiresManualReview: true };
  }
  return best;
}
