import { BoardOrientation, IRepertoire, MoveVariantNode } from "@chess-opening-master/common";
import { getDB } from "../../db/mongo";
import { ImportBatchCache, RepertoireMetadata, RepertoireMetadataCacheKey, RepertoireVariant } from "./gameImportTypes";

export const extractRepertoireVariants = (moveNodes: unknown, fallbackName: string, maxPlies = 12): RepertoireVariant[] => {
  if (!moveNodes || typeof moveNodes !== "object") {
    return [];
  }
  try {
    const variants = MoveVariantNode.initMoveVariantNode(moveNodes as IRepertoire["moveNodes"]).getVariants();
    const normalized = variants
      .map((variant) => ({
        fullName: variant.fullName || variant.name || fallbackName,
        name: variant.name || variant.fullName || fallbackName,
        movesSan: variant.moves
          .flatMap((node) => (node.move?.san ? [node.move.san] : []))
          .slice(0, maxPlies),
      }))
      .filter((variant) => variant.movesSan.length > 0);
    const unique = new Map<string, RepertoireVariant>();
    normalized.forEach((variant) => {
      const key = `${variant.fullName}::${variant.movesSan.join(" ")}`;
      if (!unique.has(key)) {
        unique.set(key, variant);
      }
    });
    return [...unique.values()];
  } catch {
    return [];
  }
};

export const prefixRatio = (a: string[], b: string[]): number => {
  if (a.length === 0 || b.length === 0) {
    return 0;
  }
  let overlap = 0;
  const limit = Math.min(a.length, b.length);
  for (let index = 0; index < limit; index += 1) {
    if (a[index] !== b[index]) {
      break;
    }
    overlap += 1;
  }
  return overlap / limit;
};

export const getBestVariantMatch = (variants: RepertoireVariant[], lineMovesSan: string[]): { variant: RepertoireVariant; ratio: number } | null => {
  if (variants.length === 0 || lineMovesSan.length === 0) {
    return null;
  }
  let best: { variant: RepertoireVariant; ratio: number } | null = null;
  variants.forEach((variant) => {
    const ratio = prefixRatio(variant.movesSan, lineMovesSan);
    if (!best || ratio > best.ratio) {
      best = { variant, ratio };
    }
  });
  return best;
};

export const buildRepertoireMetadataById = (
  repertoires: Array<{ _id: unknown; name?: unknown; moveNodes?: unknown; orientation?: unknown }>
): Map<string, RepertoireMetadata> => {
  const metadataById = new Map<string, RepertoireMetadata>();
  repertoires.forEach((repertoire) => {
    const repertoireId = String(repertoire._id);
    const repertoireName = String(repertoire.name || "Unnamed repertoire");
    const orientation = repertoire.orientation === "white" || repertoire.orientation === "black"
      ? repertoire.orientation
      : undefined;
    metadataById.set(repertoireId, {
      repertoireId,
      repertoireName,
      orientation,
      variants: extractRepertoireVariants(repertoire.moveNodes, repertoireName),
    });
  });
  return metadataById;
};

const getRepertoireMetadataCacheKey = (orientation?: BoardOrientation): RepertoireMetadataCacheKey => (
  orientation || "all"
);

const loadRepertoireMetadataById = async (
  userId: string,
  orientation?: BoardOrientation
): Promise<Map<string, RepertoireMetadata>> => {
  const db = getDB();
  const repertoires = await db.collection("repertoires")
    .find({
      userId,
      ...(orientation ? { orientation } : {}),
    })
    .project({ _id: 1, name: 1, moveNodes: 1, orientation: 1 })
    .toArray();
  return buildRepertoireMetadataById(
    repertoires.map((repertoire) => ({
      _id: repertoire._id,
      name: repertoire.name,
      moveNodes: repertoire.moveNodes,
      orientation: repertoire.orientation,
    }))
  );
};

export const getRepertoireMetadataById = async (
  userId: string,
  orientation: BoardOrientation | undefined,
  importBatchCache?: ImportBatchCache
): Promise<Map<string, RepertoireMetadata>> => {
  if (!importBatchCache) {
    return loadRepertoireMetadataById(userId, orientation);
  }
  const cacheKey = getRepertoireMetadataCacheKey(orientation);
  const cached = importBatchCache.repertoireMetadataByScope.get(cacheKey);
  if (cached) {
    return cached;
  }
  const loaded = await loadRepertoireMetadataById(userId, orientation);
  importBatchCache.repertoireMetadataByScope.set(cacheKey, loaded);
  return loaded;
};
