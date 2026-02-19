import { OpeningDetection, OpeningMapping } from "@chess-opening-master/common";
import { ImportedGameDocument } from "../../models/GameImport";
import { detectOpening, parsePgnGames } from "./pgnProcessing";
import { RepertoireMetadata } from "./gameImportTypes";
import { getBestVariantMatch } from "./repertoireMetadataService";

export const resolveOpeningName = (game: Pick<ImportedGameDocument, "openingDetection" | "openingMapping">): string => {
  return game.openingDetection.openingName
    || game.openingMapping.variantName
    || game.openingMapping.repertoireName
    || (game.openingDetection.eco ? `ECO ${game.openingDetection.eco}` : "Unknown");
};

const isOpeningMappingStrategy = (value: unknown): value is OpeningMapping["strategy"] => (
  value === "eco" ||
  value === "movePrefix" ||
  value === "fuzzyName" ||
  value === "tagOverlap" ||
  value === "manual" ||
  value === "none"
);

export const normalizeImportedOpeningData = (
  doc: ImportedGameDocument,
  repertoireMetadataById: Map<string, RepertoireMetadata>
): Pick<ImportedGameDocument, "openingDetection" | "openingMapping"> => {
  let openingDetectionBase = doc.openingDetection;
  const fallbackDetection = detectOpening({}, doc.movesSan || []);
  const lineMovesSan = Array.isArray(openingDetectionBase?.lineMovesSan) && openingDetectionBase.lineMovesSan.length > 0
    ? openingDetectionBase.lineMovesSan
    : fallbackDetection.lineMovesSan;

  const openingMappingBase = doc.openingMapping || ({ confidence: 0, strategy: "none", requiresManualReview: true } as OpeningMapping);
  const mappedRepertoireMetadata = openingMappingBase.repertoireId
    ? repertoireMetadataById.get(openingMappingBase.repertoireId)
    : undefined;
  const hasOrientationMismatch = Boolean(
    mappedRepertoireMetadata?.orientation &&
    doc.orientation &&
    mappedRepertoireMetadata.orientation !== doc.orientation
  );
  const repertoireMetadata = hasOrientationMismatch ? undefined : mappedRepertoireMetadata;
  const mappedRepertoireName = hasOrientationMismatch
    ? undefined
    : (openingMappingBase.repertoireName || repertoireMetadata?.repertoireName);
  const inferredVariant = openingMappingBase.variantName
    ? null
    : (repertoireMetadata ? getBestVariantMatch(repertoireMetadata.variants, lineMovesSan) : null);
  const mappedVariantName = hasOrientationMismatch
    ? undefined
    : (openingMappingBase.variantName || inferredVariant?.variant.fullName);
  const openingMapping: OpeningMapping = {
    confidence: hasOrientationMismatch ? 0 : (typeof openingMappingBase.confidence === "number" ? openingMappingBase.confidence : 0),
    strategy: hasOrientationMismatch ? "none" : (isOpeningMappingStrategy(openingMappingBase.strategy) ? openingMappingBase.strategy : "none"),
    requiresManualReview: hasOrientationMismatch
      ? true
      : (typeof openingMappingBase.requiresManualReview === "boolean" ? openingMappingBase.requiresManualReview : true),
    ...(openingMappingBase.repertoireId && !hasOrientationMismatch ? { repertoireId: openingMappingBase.repertoireId } : {}),
    ...(mappedRepertoireName ? { repertoireName: mappedRepertoireName } : {}),
    ...(mappedVariantName ? { variantName: mappedVariantName } : {}),
  };

  const needsPgnInference = !openingDetectionBase
    || !openingDetectionBase.lineKey
    || !Array.isArray(openingDetectionBase.lineMovesSan)
    || openingDetectionBase.lineMovesSan.length === 0
    || (!openingDetectionBase.openingName && !openingDetectionBase.eco && !mappedVariantName && !mappedRepertoireName);
  if (needsPgnInference && doc.pgn) {
    const parsed = parsePgnGames(doc.pgn)[0];
    if (parsed) {
      const inferred = detectOpening(parsed.headers, doc.movesSan && doc.movesSan.length > 0 ? doc.movesSan : parsed.movesSan);
      openingDetectionBase = {
        ...inferred,
        ...(openingDetectionBase || {}),
      };
    }
  }
  const refreshedLineMovesSan = Array.isArray(openingDetectionBase?.lineMovesSan) && openingDetectionBase.lineMovesSan.length > 0
    ? openingDetectionBase.lineMovesSan
    : lineMovesSan;
  const openingDetection: OpeningDetection = {
    ...(openingDetectionBase?.eco ? { eco: openingDetectionBase.eco } : {}),
    ...(openingDetectionBase?.openingName || inferredVariant?.variant.name || mappedVariantName || mappedRepertoireName
      ? { openingName: openingDetectionBase?.openingName || inferredVariant?.variant.name || mappedVariantName || mappedRepertoireName }
      : {}),
    lineMovesSan: refreshedLineMovesSan,
    lineKey: openingDetectionBase?.lineKey || fallbackDetection.lineKey,
    confidence: typeof openingDetectionBase?.confidence === "number" ? openingDetectionBase.confidence : fallbackDetection.confidence,
    ...(openingDetectionBase?.fallbackSignature ? { fallbackSignature: openingDetectionBase.fallbackSignature } : {}),
  };

  return { openingDetection, openingMapping };
};
