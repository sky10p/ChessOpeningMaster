import { getDB } from "../db/mongo";
import { MoveVariantNode, NewVariantPath, StudiedVariantPath, Variant } from "@chess-opening-master/common";
import { VariantInfo } from "../models/VariantInfo";

interface VariantResult {
  newVariants: NewVariantPath[];
  studiedVariants: StudiedVariantPath[];
}

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
    
    repertoireVariants.forEach((variant: Variant) => {
      if (variantsInfoMap.has(variant.fullName)) {
        const variantInfo = variantsInfoMap.get(variant.fullName);
        
        if (variantInfo) {
          const openingName = deriveOpeningName(variant.fullName);
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
              startingFen: variantInfo.startingFen,
          });
        }
      } else {
        const openingName = deriveOpeningName(variant.fullName);
        newVariants.push({
            type: "newVariant",
            repertoireId: String(repertoire._id),
            repertoireName: repertoire.name,
            name: variant.fullName,
            orientation: repertoire.orientation,
            openingName,
        });
      }
    });
  }

  return { newVariants, studiedVariants };
}

function deriveOpeningName(variantName: string): string {
  const segments = variantName.split(":");
  const opening = segments[0]?.trim();
  return opening || variantName;
}
