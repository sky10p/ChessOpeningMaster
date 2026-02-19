import { BoardOrientation } from "@chess-opening-master/common";

export type RepertoireVariant = {
  fullName: string;
  name: string;
  movesSan: string[];
};

export type RepertoireMetadata = {
  repertoireId: string;
  repertoireName: string;
  orientation?: BoardOrientation;
  variants: RepertoireVariant[];
};

export type RepertoireMetadataCacheKey = BoardOrientation | "all";

export type ImportBatchCache = {
  repertoireMetadataByScope: Map<RepertoireMetadataCacheKey, Map<string, RepertoireMetadata>>;
};

export type VariantTrainingSignal = {
  errors: number;
  dueAt?: Date;
  lastReviewedAt?: Date;
  lastDate?: Date;
};
