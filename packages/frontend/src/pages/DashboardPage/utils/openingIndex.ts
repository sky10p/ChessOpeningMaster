import {
  IRepertoire,
  IRepertoireDashboard,
  TrainVariantInfo,
} from "@chess-opening-master/common";
import { MoveVariantNode } from "../../../models/VariantNode";
import { TrainVariant, Variant } from "../../../models/chess.models";

export type DashboardOrientationFilter = "all" | "white" | "black";

export type OpeningScopedTrainVariant = TrainVariant & {
  repertoire: IRepertoireDashboard;
};

export type DashboardOpeningIndex = {
  openings: string[];
  openingToRepertoireId: Map<string, string>;
  repertoiresByOpening: Map<string, IRepertoireDashboard[]>;
  trainVariantsByOpening: Map<string, OpeningScopedTrainVariant[]>;
};

const matchesOrientation = (
  orientation: IRepertoireDashboard["orientation"],
  filter: DashboardOrientationFilter
) => filter === "all" || orientation === filter;

export const getRepertoireVariants = (
  repertoire: Pick<IRepertoireDashboard, "moveNodes">
): Variant[] => {
  if (!repertoire.moveNodes) {
    return [];
  }
  return MoveVariantNode.initMoveVariantNode(repertoire.moveNodes).getVariants();
};

export const getDashboardTrainVariants = (
  repertoire: IRepertoire
): TrainVariant[] =>
  getRepertoireVariants(repertoire).map((variant) => ({
    variant,
    state: "inProgress",
  }));

export const toTrainVariantInfoMap = (
  trainInfo: TrainVariantInfo[] = []
): Record<string, TrainVariantInfo> => {
  const infoMap: Record<string, TrainVariantInfo> = {};
  trainInfo.forEach((info) => {
    infoMap[info.variantName] = info;
  });
  return infoMap;
};

export const buildDashboardOpeningIndex = (
  repertoires: IRepertoireDashboard[]
): DashboardOpeningIndex => {
  const openingSet = new Set<string>();
  const openingToRepertoireId = new Map<string, string>();
  const repertoiresByOpening = new Map<string, IRepertoireDashboard[]>();
  const trainVariantsByOpening = new Map<string, OpeningScopedTrainVariant[]>();

  repertoires.forEach((repertoire) => {
    const variants = getRepertoireVariants(repertoire);
    const seenOpenings = new Set<string>();

    variants.forEach((variant) => {
      openingSet.add(variant.name);

      if (!openingToRepertoireId.has(variant.name)) {
        openingToRepertoireId.set(variant.name, repertoire._id);
      }

      const scopedVariants = trainVariantsByOpening.get(variant.name) || [];
      scopedVariants.push({ variant, state: "inProgress", repertoire });
      trainVariantsByOpening.set(variant.name, scopedVariants);

      if (!seenOpenings.has(variant.name)) {
        const openingRepertoires = repertoiresByOpening.get(variant.name) || [];
        openingRepertoires.push(repertoire);
        repertoiresByOpening.set(variant.name, openingRepertoires);
        seenOpenings.add(variant.name);
      }
    });
  });

  return {
    openings: Array.from(openingSet).sort(),
    openingToRepertoireId,
    repertoiresByOpening,
    trainVariantsByOpening,
  };
};

export const getOpeningRepertoires = (
  openingIndex: DashboardOpeningIndex,
  openingName: string,
  orientationFilter: DashboardOrientationFilter = "all"
): IRepertoireDashboard[] =>
  (openingIndex.repertoiresByOpening.get(openingName) || []).filter((repertoire) =>
    matchesOrientation(repertoire.orientation, orientationFilter)
  );

export const getOpeningTrainVariants = (
  openingIndex: DashboardOpeningIndex,
  openingName: string,
  orientationFilter: DashboardOrientationFilter = "all"
): OpeningScopedTrainVariant[] =>
  (openingIndex.trainVariantsByOpening.get(openingName) || []).filter(({ repertoire }) =>
    matchesOrientation(repertoire.orientation, orientationFilter)
  );
