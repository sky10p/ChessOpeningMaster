import {
  RepertoireOverviewItem,
  RepertoireOverviewOpening,
  RepertoireOverviewResponse,
} from "@chess-opening-master/common";
import { ObjectId } from "mongodb";
import { getDB } from "../db/mongo";
import { VariantInfo } from "../models/VariantInfo";
import { VariantMistake } from "../models/VariantMistake";
import { archiveStaleMistakesForRepertoire } from "./variantMistakeService";
import {
  buildStatusCounts,
  buildVariantIndex,
  calculateWeightedMastery,
  getDescriptorForStoredVariant,
  getOrCreateOpeningAggregate,
  getUtcDayKey,
  isDueMistake,
  isDueVariant,
  OpeningAggregate,
  RepertoireVariantIndex,
  START_FEN,
} from "./repertoireOverviewShared";

type RepertoireDocument = {
  _id: ObjectId;
  name: string;
  orientation?: "white" | "black";
  order: number;
  disabled?: boolean;
  favorite?: boolean;
  moveNodes?: unknown;
};

const toOpeningSummary = (
  repertoire: RepertoireDocument,
  repertoireId: string,
  openingName: string,
  grouped: OpeningAggregate,
  now: Date,
  todayKey: string
): RepertoireOverviewOpening => {
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
    masteryScore: calculateWeightedMastery(
      grouped.variantNames,
      grouped.variantInfoByName,
      grouped.variantLengths
    ),
    dueVariantsCount,
    dueMistakesCount: grouped.mistakes.filter((mistake) => isDueMistake(mistake, now, todayKey)).length,
    totalVariantsCount: grouped.variantNames.size,
    statusCounts: buildStatusCounts(grouped.variantNames, grouped.variantInfoByName),
  };
};

const buildRepertoireOverviewItem = (
  repertoire: RepertoireDocument,
  openings: RepertoireOverviewOpening[],
  variantIndex: RepertoireVariantIndex,
  variantInfoByName: Map<string, VariantInfo>
): RepertoireOverviewItem => {
  const allVariantNames = variantIndex.variants.map((variant) => variant.variantName);
  const repertoireStatusCounts = buildStatusCounts(allVariantNames, variantInfoByName);
  return {
    repertoireId: String(repertoire._id),
    repertoireName: repertoire.name,
    orientation: repertoire.orientation,
    order: repertoire.order,
    disabled: repertoire.disabled === true,
    favorite: repertoire.favorite === true,
    openingCount: openings.length,
    totalVariantsCount: repertoireStatusCounts.total,
    masteryScore: calculateWeightedMastery(
      allVariantNames,
      variantInfoByName,
      variantIndex.variantLengths
    ),
    dueVariantsCount: openings.reduce((sum, opening) => sum + opening.dueVariantsCount, 0),
    dueMistakesCount: openings.reduce((sum, opening) => sum + opening.dueMistakesCount, 0),
    statusCounts: repertoireStatusCounts,
    openings,
  };
};

export const getRepertoireOverview = async (userId: string): Promise<RepertoireOverviewResponse> => {
  const db = getDB();
  const now = new Date();
  const todayKey = getUtcDayKey(now);
  const repertoires = await db
    .collection<RepertoireDocument>("repertoires")
    .find({ userId })
    .sort({ order: 1 })
    .toArray();

  if (repertoires.length === 0) {
    return { repertoires: [] };
  }

  const repertoireIds = repertoires.map((repertoire) => String(repertoire._id));
  await Promise.all(
    repertoireIds.map((repertoireId) => archiveStaleMistakesForRepertoire({ userId, repertoireId, now }))
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

  const variantsByRepertoire = new Map<string, VariantInfo[]>();
  const mistakesByRepertoire = new Map<string, VariantMistake[]>();

  variants.forEach((variant) => {
    const existing = variantsByRepertoire.get(variant.repertoireId) || [];
    existing.push(variant);
    variantsByRepertoire.set(variant.repertoireId, existing);
  });
  mistakes.forEach((mistake) => {
    const existing = mistakesByRepertoire.get(mistake.repertoireId) || [];
    existing.push(mistake);
    mistakesByRepertoire.set(mistake.repertoireId, existing);
  });

  const overview = repertoires.map((repertoire) => {
    const repertoireId = String(repertoire._id);
    const variantsForRepertoire = variantsByRepertoire.get(repertoireId) || [];
    const mistakesForRepertoire = mistakesByRepertoire.get(repertoireId) || [];
    const variantIndex = buildVariantIndex(repertoire);
    const openingMap = new Map<string, OpeningAggregate>();
    const liveVariantInfoByName = new Map<string, VariantInfo>();

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
      const descriptor = getDescriptorForStoredVariant(variant.variantName, variantIndex);
      if (!descriptor) {
        return;
      }
      liveVariantInfoByName.set(descriptor.variantName, variant);
      const grouped = getOrCreateOpeningAggregate(
        openingMap,
        descriptor.openingName,
        descriptor.openingFen || variantIndex.openingFens.get(descriptor.openingName)
      );
      grouped.variantNames.add(descriptor.variantName);
      grouped.variantInfoByName.set(descriptor.variantName, variant);
      if (!grouped.variantLengths.has(descriptor.variantName)) {
        grouped.variantLengths.set(descriptor.variantName, descriptor.length);
      }
    });

    mistakesForRepertoire.forEach((mistake) => {
      const descriptor = getDescriptorForStoredVariant(mistake.variantName, variantIndex);
      if (!descriptor) {
        return;
      }
      const grouped = getOrCreateOpeningAggregate(
        openingMap,
        descriptor.openingName,
        descriptor.openingFen || variantIndex.openingFens.get(descriptor.openingName)
      );
      grouped.mistakes.push(mistake);
      if (!grouped.openingFen && descriptor.openingFen) {
        grouped.openingFen = descriptor.openingFen;
      }
    });

    const openings = Array.from(openingMap.entries())
      .map(([openingName, grouped]) =>
        toOpeningSummary(repertoire, repertoireId, openingName, grouped, now, todayKey)
      )
      .sort((left, right) => left.openingName.localeCompare(right.openingName));

    return buildRepertoireOverviewItem(repertoire, openings, variantIndex, liveVariantInfoByName);
  });

  return { repertoires: overview };
};
