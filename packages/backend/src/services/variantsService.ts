import { getDB } from "../db/mongo";
import {
  getVariantEntryPly,
  getOpeningNameFromVariant,
  MoveVariantNode,
  NewVariantPath,
  StudiedVariantPath,
} from "@chess-opening-master/common";
import { VariantInfo } from "../models/VariantInfo";

interface VariantResult {
  newVariants: NewVariantPath[];
  studiedVariants: StudiedVariantPath[];
}

type TreeVariant = ReturnType<MoveVariantNode["getVariants"]>[number];

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const getVariantStartingFen = (variant: TreeVariant): string | undefined => {
  if (!Array.isArray(variant.moves) || variant.moves.length === 0) {
    return START_FEN;
  }

  const entryPly = Math.max(0, getVariantEntryPly(variant));
  if (entryPly === 0) {
    return START_FEN;
  }

  const startNode = variant.moves.find((moveNode) => moveNode.position === entryPly);
  const move = startNode?.getMove() as { after?: string } | undefined;
  if (typeof move?.after === "string" && move.after.trim()) {
    return move.after;
  }

  return undefined;
};

export const getAllVariants = async (userId: string): Promise<VariantResult> => {
  const db = getDB();
  
  const activeRepertoires = await db
    .collection("repertoires")
    .find({ disabled: { $ne: true }, userId })
    .toArray();
  
  const variantsInfoRecords = await db
    .collection<VariantInfo>("variantsInfo")
    .find({ userId })
    .toArray();
  
  const variantsInfoMap = new Map<string, VariantInfo>();
  variantsInfoRecords.forEach(info => {
    if (info.variantName) {
      variantsInfoMap.set(info.variantName, info);
    }
  });
  
  const newVariants: NewVariantPath[] = [];
  const studiedVariants: StudiedVariantPath[] = [];

  for (const repertoire of activeRepertoires) {
    if (!repertoire.moveNodes) continue;
    
    const moveVariantNode = MoveVariantNode.initMoveVariantNode(repertoire.moveNodes);
    const repertoireVariants = moveVariantNode.getVariants();
    
    repertoireVariants.forEach((variant) => {
      const exactStartingFen = getVariantStartingFen(variant);
      if (variantsInfoMap.has(variant.fullName)) {
        const variantInfo = variantsInfoMap.get(variant.fullName);
        
        if (variantInfo) {
          const openingName = getOpeningNameFromVariant(variant.fullName);
          studiedVariants.push({
              type: "variant",
              id: variantInfo._id.toString(),
              repertoireId: String(repertoire._id),
              repertoireName: repertoire.name,
              name: variant.fullName,
              errors: variantInfo.errors || 0,
              lastDate: variantInfo.lastDate,
              dueAt: variantInfo.dueAt,
              lastReviewedDayKey: variantInfo.lastReviewedDayKey,
              lastRating: variantInfo.lastRating ?? null,
              orientation: repertoire.orientation,
              openingName: variantInfo.openingName || openingName,
              startingFen: exactStartingFen ?? variantInfo.startingFen,
          });
        }
      } else {
        const openingName = getOpeningNameFromVariant(variant.fullName);
        newVariants.push({
            type: "newVariant",
            repertoireId: String(repertoire._id),
            repertoireName: repertoire.name,
            name: variant.fullName,
            orientation: repertoire.orientation,
            openingName,
            startingFen: exactStartingFen,
        });
      }
    });
  }

  return { newVariants, studiedVariants };
}
