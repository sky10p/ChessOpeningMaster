import { ObjectId } from "mongodb";
import {
  AccountSyncFeedback,
  BoardOrientation,
  GameStatsFilters,
  GameTimeControlBucket,
  GamesStatsSummary,
  ImportSummary,
  ImportedGame,
  IRepertoire,
  LinkedGameAccount,
  LineStudyCandidate,
  MoveVariantNode,
  OpeningDetection,
  OpeningMapping,
  TrainingPlan,
  TrainingPlanWeights,
} from "@chess-opening-master/common";
import { getDB } from "../../db/mongo";
import { DEFAULT_TRAINING_PLAN_WEIGHTS, ImportedGameDocument, LinkedGameAccountDocument, TrainingPlanDocument } from "../../models/GameImport";
import { decryptSecret, encryptSecret } from "./security";
import { chessComProvider } from "./providers/chessComProvider";
import { lichessProvider } from "./providers/lichessProvider";
import { manualPgnProvider } from "./providers/manualPgnProvider";
import { buildFallbackDedupeKey, detectOpening, inferOrientation, parsePgnGames, toNormalizedResult } from "./pgnProcessing";

interface ProviderImportInput {
  source: "lichess" | "chesscom" | "manual";
  username?: string;
  token?: string;
  pgn?: string;
  tournamentGroup?: string;
  tags?: string[];
}

export interface ImportedGamesFilters {
  source?: "lichess" | "chesscom" | "manual";
  color?: "white" | "black";
  dateFrom?: string;
  dateTo?: string;
  timeControlBucket?: GameTimeControlBucket;
  openingQuery?: string;
  mapped?: "mapped" | "unmapped" | "all";
}

const resolveOpeningName = (game: Pick<ImportedGameDocument, "openingDetection" | "openingMapping">): string => {
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

const normalizeImportedOpeningData = (
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

const mapImportedGame = (
  doc: ImportedGameDocument & { _id: ObjectId },
  repertoireMetadataById: Map<string, RepertoireMetadata>
): ImportedGame => {
  const normalized = normalizeImportedOpeningData(doc, repertoireMetadataById);
  return {
    id: doc._id.toString(),
    source: doc.source,
    providerGameId: doc.providerGameId,
    white: doc.white,
    black: doc.black,
    whiteRating: doc.whiteRating,
    blackRating: doc.blackRating,
    result: doc.result,
    timeControl: doc.timeControl,
    timeControlBucket: doc.timeControlBucket || toTimeControlBucket(doc.timeControl),
    rated: doc.rated,
    playedAt: doc.playedAt?.toISOString(),
    pgn: doc.pgn,
    movesSan: doc.movesSan,
    orientation: doc.orientation,
    tournamentGroup: doc.tournamentGroup,
    tags: doc.tags,
    openingDetection: normalized.openingDetection,
    openingMapping: normalized.openingMapping,
  };
};

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const mapAccount = (doc: LinkedGameAccountDocument & { _id: ObjectId }): LinkedGameAccount => ({
  id: doc._id.toString(),
  provider: doc.provider,
  username: doc.username,
  connectedAt: doc.connectedAt.toISOString(),
  lastSyncAt: doc.lastSyncAt?.toISOString(),
  status: doc.status,
  lastError: doc.lastError,
  lastSyncStartedAt: doc.lastSyncStartedAt?.toISOString(),
  lastSyncFinishedAt: doc.lastSyncFinishedAt?.toISOString(),
  lastSyncFeedback: doc.lastSyncFeedback,
});

type RepertoireVariant = {
  fullName: string;
  name: string;
  movesSan: string[];
};

type RepertoireMetadata = {
  repertoireId: string;
  repertoireName: string;
  orientation?: BoardOrientation;
  variants: RepertoireVariant[];
};

type RepertoireMetadataCacheKey = BoardOrientation | "all";

type ImportBatchCache = {
  repertoireMetadataByScope: Map<RepertoireMetadataCacheKey, Map<string, RepertoireMetadata>>;
};

type VariantTrainingSignal = {
  errors: number;
  dueAt?: Date;
  lastReviewedAt?: Date;
  lastDate?: Date;
};

const extractRepertoireVariants = (moveNodes: unknown, fallbackName: string, maxPlies = 12): RepertoireVariant[] => {
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

const prefixRatio = (a: string[], b: string[]): number => {
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

const getBestVariantMatch = (variants: RepertoireVariant[], lineMovesSan: string[]): { variant: RepertoireVariant; ratio: number } | null => {
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

const buildRepertoireMetadataById = (
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

const getRepertoireMetadataById = async (
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

const buildVariantTrainingKey = (repertoireId: string, variantName: string): string => `${repertoireId}::${variantName.trim().toLowerCase()}`;

const toOptionalIsoString = (value?: Date): string | undefined => (value ? value.toISOString() : undefined);

const nameSimilarity = (a: string, b: string): number => {
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

const toTimeControlBucket = (value?: string): GameTimeControlBucket | undefined => {
  if (!value) {
    return undefined;
  }
  const normalized = value.trim().toLowerCase();
  if (normalized.includes("bullet")) {
    return "bullet";
  }
  if (normalized.includes("blitz")) {
    return "blitz";
  }
  if (normalized.includes("rapid")) {
    return "rapid";
  }
  if (normalized.includes("classical") || normalized.includes("daily") || normalized.includes("correspondence")) {
    return "classical";
  }
  const raw = value.split("+")[0];
  const seconds = Number(raw);
  if (!Number.isFinite(seconds)) {
    if (raw.includes("/")) {
      const parts = raw.split("/");
      const denominator = Number(parts[1]);
      if (Number.isFinite(denominator) && denominator > 0) {
        return denominator >= 1800 ? "classical" : denominator >= 600 ? "rapid" : denominator >= 180 ? "blitz" : "bullet";
      }
    }
    return undefined;
  }
  if (seconds < 180) {
    return "bullet";
  }
  if (seconds < 600) {
    return "blitz";
  }
  if (seconds < 1800) {
    return "rapid";
  }
  return "classical";
};

const parseDateHeader = (value?: string): Date | undefined => {
  if (!value) {
    return undefined;
  }
  const normalized = value.replace(/\./g, "-");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date;
};

async function buildOpeningMapping(
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

export async function listLinkedAccounts(userId: string): Promise<LinkedGameAccount[]> {
  const db = getDB();
  const accounts = await db.collection<LinkedGameAccountDocument>("linkedGameAccounts").find({ userId }).toArray();
  return accounts.map((doc) => mapAccount({ ...doc, _id: doc._id as unknown as ObjectId }));
}

export async function upsertLinkedAccount(userId: string, provider: "lichess" | "chesscom", username: string, token?: string): Promise<LinkedGameAccount> {
  const db = getDB();
  const now = new Date();
  await db.collection<LinkedGameAccountDocument>("linkedGameAccounts").updateOne(
    { userId, provider },
    {
      $set: {
        userId,
        provider,
        username,
        status: "idle",
        ...(token ? { tokenEncrypted: encryptSecret(token) } : {}),
      },
      $setOnInsert: { connectedAt: now },
    },
    { upsert: true }
  );
  const account = await db.collection<LinkedGameAccountDocument>("linkedGameAccounts").findOne({ userId, provider });
  return mapAccount({ ...(account as LinkedGameAccountDocument), _id: account?._id as unknown as ObjectId });
}

export async function disconnectLinkedAccount(userId: string, provider: "lichess" | "chesscom"): Promise<void> {
  const db = getDB();
  await db.collection("linkedGameAccounts").deleteOne({ userId, provider });
}

export async function importGamesForUser(userId: string, input: ProviderImportInput): Promise<ImportSummary> {
  const db = getDB();
  const accountsCollection = db.collection<LinkedGameAccountDocument>("linkedGameAccounts");
  const gamesCollection = db.collection<ImportedGameDocument>("importedGames");

  let importedCount = 0;
  let duplicateCount = 0;
  let failedCount = 0;
  const startedAt = new Date();
  let processedCount = 0;

  const setAccountStatus = async (
    provider: "lichess" | "chesscom",
    status: "running" | "failed" | "completed",
    lastError?: string,
    summary?: AccountSyncFeedback
  ) => {
    const setFields: Partial<LinkedGameAccountDocument> & Record<string, unknown> = {
      status,
    };
    const unsetFields: Record<string, "" | 1 | true> = {};
    if (status === "running") {
      setFields.lastSyncStartedAt = startedAt;
    }
    if (status === "completed") {
      const finishedAt = new Date();
      setFields.lastSyncAt = finishedAt;
      setFields.lastSyncFinishedAt = finishedAt;
      if (summary) {
        setFields.lastSyncFeedback = summary;
      }
      unsetFields.lastError = "";
    }
    if (status === "failed") {
      setFields.lastSyncFinishedAt = new Date();
      if (lastError) {
        setFields.lastError = lastError;
      }
    }
    await accountsCollection.updateOne(
      { userId, provider },
      {
        $set: setFields,
        ...(Object.keys(unsetFields).length > 0 ? { $unset: unsetFields } : {}),
      }
    );
  };

  const linked = input.source === "manual" ? null : await accountsCollection.findOne({ userId, provider: input.source });
  const username = input.username || linked?.username;
  const token = input.token || decryptSecret(linked?.tokenEncrypted);
  const hasExistingGamesForSource = input.source === "manual"
    ? true
    : (await gamesCollection.findOne({ userId, source: input.source }, { projection: { _id: 1 } })) !== null;
  const syncSince = hasExistingGamesForSource ? linked?.lastSyncAt : undefined;
  const importBatchCache: ImportBatchCache = {
    repertoireMetadataByScope: new Map<RepertoireMetadataCacheKey, Map<string, RepertoireMetadata>>(),
  };

  try {
    if (input.source !== "manual") {
      await setAccountStatus(input.source, "running");
    }

    const providerGames =
      input.source === "manual"
        ? (await manualPgnProvider.importGames(input.pgn || "")).map((game) => ({ ...game, providerGameId: undefined }))
        : input.source === "lichess"
          ? await lichessProvider.importGames({ username: username || "", token, since: syncSince, max: 250 })
          : await chessComProvider.importGames({ username: username || "", since: syncSince, max: 250 });

    for (const game of providerGames) {
      try {
        processedCount += 1;
        const white = game.headers.White || "Unknown";
        const black = game.headers.Black || "Unknown";
        const playedAt = parseDateHeader(game.headers.UTCDate || game.headers.Date);
        const dedupeKey = game.providerGameId
          ? `${input.source}:${game.providerGameId}`
          : buildFallbackDedupeKey(input.source, playedAt?.toISOString(), white, black, game.headers.Result, game.movesSan);
        const alreadyExists = await gamesCollection.findOne({ userId, dedupeKey }, { projection: { _id: 1 } });
        if (alreadyExists) {
          duplicateCount += 1;
          continue;
        }

        const openingDetection = detectOpening(game.headers, game.movesSan);
        const orientation = inferOrientation(username, white, black);
        const openingMapping = await buildOpeningMapping(
          userId,
          orientation,
          openingDetection.openingName,
          openingDetection.eco,
          openingDetection.lineMovesSan,
          input.tags,
          importBatchCache
        );
        const resolvedOpeningName = openingDetection.openingName || openingMapping.variantName || openingMapping.repertoireName;
        const result = toNormalizedResult(game.headers.Result);
        const doc: ImportedGameDocument = {
          userId,
          source: input.source,
          providerGameId: game.providerGameId,
          dedupeKey,
          white,
          black,
          whiteRating: Number(game.headers.WhiteElo) || undefined,
          blackRating: Number(game.headers.BlackElo) || undefined,
          result,
          timeControl: game.headers.TimeControl,
          timeControlBucket: toTimeControlBucket(game.headers.TimeControl),
          rated: game.headers.Rated ? game.headers.Rated.toLowerCase() === "true" : undefined,
          playedAt,
          pgn: game.pgn,
          movesSan: game.movesSan,
          orientation,
          tournamentGroup: input.tournamentGroup,
          tags: input.tags,
          openingDetection: {
            ...openingDetection,
            ...(resolvedOpeningName ? { openingName: resolvedOpeningName } : {}),
          },
          openingMapping,
          createdAt: startedAt,
        };
        await gamesCollection.insertOne(doc);
        importedCount += 1;
      } catch (error) {
        failedCount += 1;
        console.error("Game import failed", {
          userId,
          source: input.source,
          providerGameId: game.providerGameId,
          white: game.headers.White || "Unknown",
          black: game.headers.Black || "Unknown",
          gameDate: game.headers.UTCDate || game.headers.Date,
          result: game.headers.Result,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
    }

    if (input.source !== "manual") {
      await setAccountStatus(input.source, "completed", undefined, {
        source: input.source,
        importedCount,
        duplicateCount,
        failedCount,
        processedCount,
        startedAt: startedAt.toISOString(),
        finishedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    if (input.source !== "manual") {
      await setAccountStatus(input.source, "failed", error instanceof Error ? error.message : "Import failed");
    }
    throw error;
  }

  return {
    source: input.source,
    importedCount,
    duplicateCount,
    failedCount,
    processedCount,
    statsRefreshedAt: new Date().toISOString(),
  };
}

export async function listImportedGames(userId: string, limit = 100, filters: ImportedGamesFilters = {}): Promise<ImportedGame[]> {
  const db = getDB();
  const scanLimit = filters.timeControlBucket ? Math.max(limit * 6, limit + 200) : limit;
  const docs = await db.collection<ImportedGameDocument>("importedGames")
    .find(buildImportedGamesFilter(userId, filters))
    .sort({ playedAt: -1, createdAt: -1 })
    .limit(scanLimit)
    .toArray();
  const repertoires = await db.collection("repertoires").find({ userId }).project({ _id: 1, name: 1, moveNodes: 1, orientation: 1 }).toArray();
  const repertoireMetadataById = buildRepertoireMetadataById(
    repertoires.map((repertoire) => ({
      _id: repertoire._id,
      name: repertoire.name,
      moveNodes: repertoire.moveNodes,
      orientation: repertoire.orientation,
    }))
  );
  const filteredByTimeControl = filters.timeControlBucket
    ? docs.filter((doc) => (doc.timeControlBucket || toTimeControlBucket(doc.timeControl)) === filters.timeControlBucket)
    : docs;
  return filteredByTimeControl
    .slice(0, limit)
    .map((doc) => mapImportedGame({ ...doc, _id: doc._id as unknown as ObjectId }, repertoireMetadataById));
}

export async function deleteImportedGame(userId: string, gameId: string): Promise<boolean> {
  if (!ObjectId.isValid(gameId)) {
    return false;
  }
  const db = getDB();
  const result = await db.collection<ImportedGameDocument>("importedGames").deleteOne({
    userId,
    _id: new ObjectId(gameId),
  });
  return result.deletedCount === 1;
}

export async function clearImportedGames(userId: string, filters: ImportedGamesFilters = {}): Promise<number> {
  const db = getDB();
  const shouldResetSyncCursor = (
    !filters.color &&
    !filters.dateFrom &&
    !filters.dateTo &&
    !filters.timeControlBucket &&
    (!filters.openingQuery || filters.openingQuery.trim().length === 0) &&
    (!filters.mapped || filters.mapped === "all")
  );
  const resetLinkedAccountsIfNeeded = async () => {
    if (!shouldResetSyncCursor || filters.source === "manual") {
      return;
    }
    await db.collection<LinkedGameAccountDocument>("linkedGameAccounts").updateMany(
      {
        userId,
        ...(filters.source ? { provider: filters.source } : {}),
      },
      {
        $set: { status: "idle" },
        $unset: {
          lastSyncAt: "",
          lastSyncFeedback: "",
          lastSyncStartedAt: "",
          lastSyncFinishedAt: "",
          lastError: "",
        },
      }
    );
  };

  if (filters.timeControlBucket) {
    const docs = await db.collection<ImportedGameDocument>("importedGames")
      .find(buildImportedGamesFilter(userId, { ...filters, timeControlBucket: undefined }))
      .project({ _id: 1, timeControl: 1, timeControlBucket: 1 })
      .toArray();
    const idsToDelete = docs
      .filter((doc) => (doc.timeControlBucket || toTimeControlBucket(doc.timeControl)) === filters.timeControlBucket)
      .map((doc) => doc._id)
      .filter((id): id is ObjectId => Boolean(id));
    if (idsToDelete.length === 0) {
      return 0;
    }
    const result = await db.collection<ImportedGameDocument>("importedGames").deleteMany({
      userId,
      _id: { $in: idsToDelete },
    });
    if ((result.deletedCount || 0) > 0) {
      await resetLinkedAccountsIfNeeded();
    }
    return result.deletedCount || 0;
  }
  const result = await db.collection<ImportedGameDocument>("importedGames").deleteMany(buildImportedGamesFilter(userId, filters));
  if ((result.deletedCount || 0) > 0) {
    await resetLinkedAccountsIfNeeded();
  }
  return result.deletedCount || 0;
}

const buildStatsFilter = (userId: string, filters: GameStatsFilters): Record<string, unknown> => {
  const filter: Record<string, unknown> = { userId };
  if (filters.source) {
    filter.source = filters.source;
  }
  if (filters.dateFrom || filters.dateTo) {
    filter.playedAt = {
      ...(filters.dateFrom ? { $gte: new Date(filters.dateFrom) } : {}),
      ...(filters.dateTo ? { $lte: new Date(filters.dateTo) } : {}),
    };
  }
  if (filters.ratedOnly) {
    filter.rated = true;
  }
  if (filters.color) {
    filter.orientation = filters.color;
  }
  if (filters.tournamentGroup) {
    filter.tournamentGroup = filters.tournamentGroup;
  }
  if (filters.mapped === "mapped") {
    filter["openingMapping.repertoireId"] = { $exists: true, $ne: null };
  }
  if (filters.mapped === "unmapped") {
    filter.$or = [
      { "openingMapping.repertoireId": { $exists: false } },
      { "openingMapping.repertoireId": null },
    ];
  }
  if (filters.openingQuery) {
    const query = filters.openingQuery.trim();
    if (query.length > 0) {
      const re = new RegExp(escapeRegex(query), "i");
      filter.$and = [
        ...(Array.isArray(filter.$and) ? filter.$and : []),
        {
          $or: [
            { "openingDetection.openingName": re },
            { "openingMapping.variantName": re },
            { "openingMapping.repertoireName": re },
            { "openingDetection.eco": re },
          ],
        },
      ];
    }
  }
  return filter;
};

const buildImportedGamesFilter = (userId: string, filters: ImportedGamesFilters): Record<string, unknown> => {
  const filter: Record<string, unknown> = { userId };
  if (filters.source) {
    filter.source = filters.source;
  }
  if (filters.color) {
    filter.orientation = filters.color;
  }
  if (filters.dateFrom || filters.dateTo) {
    filter.playedAt = {
      ...(filters.dateFrom ? { $gte: new Date(filters.dateFrom) } : {}),
      ...(filters.dateTo ? { $lte: new Date(filters.dateTo) } : {}),
    };
  }
  if (filters.mapped === "mapped") {
    filter["openingMapping.repertoireId"] = { $exists: true, $ne: null };
  }
  if (filters.mapped === "unmapped") {
    filter.$or = [
      { "openingMapping.repertoireId": { $exists: false } },
      { "openingMapping.repertoireId": null },
    ];
  }
  if (filters.openingQuery) {
    const query = filters.openingQuery.trim();
    if (query.length > 0) {
      const re = new RegExp(escapeRegex(query), "i");
      filter.$and = [
        ...(Array.isArray(filter.$and) ? filter.$and : []),
        {
          $or: [
            { "openingDetection.openingName": re },
            { "openingMapping.variantName": re },
            { "openingMapping.repertoireName": re },
            { "openingDetection.eco": re },
          ],
        },
      ];
    }
  }
  return filter;
};

type PerspectiveOutcome = "win" | "draw" | "loss" | "unknown";

const getPerspectiveOutcome = (game: ImportedGameDocument): PerspectiveOutcome => {
  if (game.orientation === "white") {
    if (game.result === "1-0") return "win";
    if (game.result === "0-1") return "loss";
    if (game.result === "1/2-1/2") return "draw";
    return "unknown";
  }
  if (game.orientation === "black") {
    if (game.result === "0-1") return "win";
    if (game.result === "1-0") return "loss";
    if (game.result === "1/2-1/2") return "draw";
    return "unknown";
  }
  if (game.result === "1/2-1/2") {
    return "draw";
  }
  return "unknown";
};

const computeResults = (games: ImportedGameDocument[]) => {
  let wins = 0;
  let draws = 0;
  let losses = 0;
  games.forEach((game) => {
    const outcome = getPerspectiveOutcome(game);
    if (outcome === "win") {
      wins += 1;
      return;
    }
    if (outcome === "loss") {
      losses += 1;
      return;
    }
    if (outcome === "draw") {
      draws += 1;
    }
  });
  return { wins, draws, losses };
};

const topOpenings = (games: ImportedGameDocument[]): Array<{ openingName: string; count: number }> => {
  const counts = new Map<string, number>();
  games.forEach((game) => {
    const openingName = resolveOpeningName(game);
    counts.set(openingName, (counts.get(openingName) || 0) + 1);
  });
  return [...counts.entries()].map(([openingName, count]) => ({ openingName, count })).sort((a, b) => b.count - a.count).slice(0, 10);
};

const buildLinesToStudy = (
  games: ImportedGameDocument[],
  variantTrainingByKey: Map<string, VariantTrainingSignal>
): LineStudyCandidate[] => {
  const grouped = new Map<string, ImportedGameDocument[]>();
  games.forEach((game) => {
    const key = game.openingDetection.lineKey;
    grouped.set(key, [...(grouped.get(key) || []), game]);
  });
  const now = Date.now();
  return [...grouped.entries()].map(([lineKey, lineGames]) => {
    const { wins, draws, losses } = computeResults(lineGames);
    const total = lineGames.length;
    const mappedGames = lineGames.filter((game) => Boolean(game.openingMapping.repertoireId)).length;
    const manualReviewGames = lineGames.filter((game) => game.openingMapping.requiresManualReview).length;
    const deviationRate = total > 0 ? manualReviewGames / total : 0;
    const averageMappingConfidence = total > 0
      ? lineGames.reduce((sum, game) => sum + (game.openingMapping.confidence || 0), 0) / total
      : 0;
    const mappedRatio = total > 0 ? mappedGames / total : 0;
    const repertoireGapScore = 1 - Math.min(1, averageMappingConfidence * Math.max(mappedRatio, 0.1));
    const repertoireCounts = new Map<string, { repertoireId?: string; repertoireName: string; count: number }>();
    const variantCounts = new Map<string, { variantName: string; count: number }>();
    lineGames.forEach((game) => {
      if (!game.openingMapping.repertoireName) {
        if (game.openingMapping.variantName) {
          const existingVariant = variantCounts.get(game.openingMapping.variantName);
          variantCounts.set(game.openingMapping.variantName, {
            variantName: game.openingMapping.variantName,
            count: (existingVariant?.count || 0) + 1,
          });
        }
      } else {
        const key = game.openingMapping.repertoireId || game.openingMapping.repertoireName;
        const existing = repertoireCounts.get(key);
        if (existing) {
          repertoireCounts.set(key, { ...existing, count: existing.count + 1 });
        } else {
          repertoireCounts.set(key, {
            repertoireId: game.openingMapping.repertoireId,
            repertoireName: game.openingMapping.repertoireName,
            count: 1,
          });
        }
        if (game.openingMapping.variantName) {
          const existingVariant = variantCounts.get(game.openingMapping.variantName);
          variantCounts.set(game.openingMapping.variantName, {
            variantName: game.openingMapping.variantName,
            count: (existingVariant?.count || 0) + 1,
          });
        }
      }
    });
    const topRepertoire = [...repertoireCounts.values()].sort((a, b) => b.count - a.count)[0];
    const topRepertoireId = topRepertoire?.repertoireId;
    const repertoireName = topRepertoire?.repertoireName;
    const topVariant = [...variantCounts.values()].sort((a, b) => b.count - a.count)[0];
    const variantName = topVariant?.variantName;
    const trainingSignal = topRepertoireId && variantName
      ? variantTrainingByKey.get(buildVariantTrainingKey(topRepertoireId, variantName))
      : undefined;
    const trainingErrors = trainingSignal?.errors || 0;
    const trainingDueAt = toOptionalIsoString(trainingSignal?.dueAt);
    const trainingLastReviewedAt = toOptionalIsoString(trainingSignal?.lastReviewedAt || trainingSignal?.lastDate);
    const targetLabel = variantName || repertoireName || "this line";
    const winRate = total > 0 ? (wins + draws * 0.5) / total : 0;
    const underperformanceScore = 1 - winRate;
    const recentTs = Math.max(...lineGames.map((game) => game.playedAt?.getTime() || 0));
    const recencyScore = recentTs ? Math.max(0, 1 - (now - recentTs) / (1000 * 60 * 60 * 24 * 60)) : 0;
    const frequencyScore = Math.min(1, total / 10);
    const suggestedTasks = [
      trainingErrors > 0 ? `Fix ${trainingErrors} recorded training error${trainingErrors > 1 ? "s" : ""} in ${targetLabel}` : "",
      targetLabel && averageMappingConfidence >= 0.75
        ? `Review ${targetLabel} line until ply ${Math.min(14, lineGames[0].openingDetection.lineMovesSan.length)}`
        : "Map this line to your repertoire and verify move order",
      underperformanceScore > 0.45 ? "Replay your recent losses in this line and identify the first critical mistake" : "",
      deviationRate > 0.3 ? `Practice first ${Math.min(12, lineGames[0].openingDetection.lineMovesSan.length)} plies to reduce early deviations` : "",
      frequencyScore > 0.45 ? "Play 3 focused training games starting from this line" : "",
    ].filter(Boolean);
    return {
      lineKey,
      eco: lineGames[0].openingDetection.eco,
      openingName: resolveOpeningName(lineGames[0]),
      variantName,
      movesSan: lineGames[0].openingDetection.lineMovesSan,
      sampleGameIds: lineGames.slice(0, 3).map((game) => String(game._id || "")),
      repertoireName,
      games: total,
      mappedGames,
      manualReviewGames,
      averageMappingConfidence,
      repertoireGapScore,
      wins,
      draws,
      losses,
      deviationRate,
      underperformanceScore,
      recencyScore,
      frequencyScore,
      trainingErrors,
      trainingDueAt,
      trainingLastReviewedAt,
      suggestedTasks,
    };
  }).filter((line) => (
    line.games >= 2 ||
    line.underperformanceScore > 0.55 ||
    line.deviationRate > 0.5
  ))
    .sort((a, b) => (
      ((b.trainingErrors || 0) * 0.15 + b.underperformanceScore + b.frequencyScore + b.recencyScore + b.deviationRate + b.repertoireGapScore) -
      ((a.trainingErrors || 0) * 0.15 + a.underperformanceScore + a.frequencyScore + a.recencyScore + a.deviationRate + a.repertoireGapScore)
    ))
    .slice(0, 12);
};

export async function getGamesStats(userId: string, filters: GameStatsFilters): Promise<GamesStatsSummary> {
  const db = getDB();
  const collection = db.collection<ImportedGameDocument>("importedGames");
  const allGames = await collection.find(buildStatsFilter(userId, filters)).toArray();
  const variantTrainingInfoDocs = await db.collection("variantsInfo")
    .find({ userId })
    .project({ repertoireId: 1, variantName: 1, errors: 1, dueAt: 1, lastReviewedAt: 1, lastDate: 1 })
    .toArray();
  const variantTrainingByKey = new Map<string, VariantTrainingSignal>();
  variantTrainingInfoDocs.forEach((doc) => {
    const repertoireId = typeof doc.repertoireId === "string" ? doc.repertoireId : undefined;
    const variantName = typeof doc.variantName === "string" ? doc.variantName : undefined;
    if (!repertoireId || !variantName) {
      return;
    }
    variantTrainingByKey.set(buildVariantTrainingKey(repertoireId, variantName), {
      errors: typeof doc.errors === "number" ? doc.errors : 0,
      dueAt: doc.dueAt instanceof Date ? doc.dueAt : undefined,
      lastReviewedAt: doc.lastReviewedAt instanceof Date ? doc.lastReviewedAt : undefined,
      lastDate: doc.lastDate instanceof Date ? doc.lastDate : undefined,
    });
  });
  const repertoires = await db.collection("repertoires").find({ userId }).project({ _id: 1, name: 1, moveNodes: 1, orientation: 1 }).toArray();
  const repertoireMetadataById = buildRepertoireMetadataById(
    repertoires.map((repertoire) => ({
      _id: repertoire._id,
      name: repertoire.name,
      moveNodes: repertoire.moveNodes,
      orientation: repertoire.orientation,
    }))
  );
  const normalizedGames = allGames.map((game) => ({
    ...game,
    ...normalizeImportedOpeningData(game, repertoireMetadataById),
  }));
  const bucketed = filters.timeControlBucket
    ? normalizedGames.filter((game) => (game.timeControlBucket || toTimeControlBucket(game.timeControl)) === filters.timeControlBucket)
    : normalizedGames;
  const { wins, draws, losses } = computeResults(bucketed);
  const totalGames = bucketed.length;
  const bySourceMap = new Map<ImportedGameDocument["source"], number>();
  let mappedToRepertoireCount = 0;
  let needsManualReviewCount = 0;
  const uniqueLines = new Set<string>();
  const mappedByRepertoireId = new Map<string, number>();
  const openingPerformanceMap = new Map<string, {
    openingName: string;
    games: number;
    wins: number;
    draws: number;
    losses: number;
    mappedGames: number;
    manualReviewGames: number;
    sampleLine: string[];
  }>();
  const variantPerformanceMap = new Map<string, {
    variantKey: string;
    variantName: string;
    repertoireId?: string;
    repertoireName?: string;
    games: number;
    wins: number;
    draws: number;
    losses: number;
    mappedGames: number;
    manualReviewGames: number;
  }>();
  const gamesByMonthMap = new Map<string, { month: string; games: number; wins: number; draws: number; losses: number }>();
  bucketed.forEach((game) => {
    bySourceMap.set(game.source, (bySourceMap.get(game.source) || 0) + 1);
    if (game.openingMapping.repertoireId) {
      mappedToRepertoireCount += 1;
      mappedByRepertoireId.set(
        game.openingMapping.repertoireId,
        (mappedByRepertoireId.get(game.openingMapping.repertoireId) || 0) + 1
      );
    }
    if (game.openingMapping.requiresManualReview) {
      needsManualReviewCount += 1;
    }
    uniqueLines.add(game.openingDetection.lineKey);
    const openingName = resolveOpeningName(game);
    const existing = openingPerformanceMap.get(openingName) || {
      openingName,
      games: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      mappedGames: 0,
      manualReviewGames: 0,
      sampleLine: game.openingDetection.lineMovesSan.slice(0, 12),
    };
    existing.games += 1;
    if (game.openingMapping.repertoireId) {
      existing.mappedGames += 1;
    }
    if (game.openingMapping.requiresManualReview) {
      existing.manualReviewGames += 1;
    }
    const outcome = getPerspectiveOutcome(game);
    const monthKey = game.playedAt ? game.playedAt.toISOString().slice(0, 7) : "unknown";
    const monthStats = gamesByMonthMap.get(monthKey) || { month: monthKey, games: 0, wins: 0, draws: 0, losses: 0 };
    monthStats.games += 1;
    if (outcome === "win") {
      existing.wins += 1;
      monthStats.wins += 1;
    } else if (outcome === "loss") {
      existing.losses += 1;
      monthStats.losses += 1;
    } else if (outcome === "draw") {
      existing.draws += 1;
      monthStats.draws += 1;
    }
    gamesByMonthMap.set(monthKey, monthStats);

    const variantName = game.openingMapping.variantName || game.openingDetection.openingName || resolveOpeningName(game);
    const variantKey = `${game.openingMapping.repertoireId || "none"}::${variantName}`;
    const variantStats = variantPerformanceMap.get(variantKey) || {
      variantKey,
      variantName,
      repertoireId: game.openingMapping.repertoireId,
      repertoireName: game.openingMapping.repertoireName,
      games: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      mappedGames: 0,
      manualReviewGames: 0,
    };
    variantStats.games += 1;
    if (game.openingMapping.repertoireId) {
      variantStats.mappedGames += 1;
    }
    if (game.openingMapping.requiresManualReview) {
      variantStats.manualReviewGames += 1;
    }
    if (outcome === "win") {
      variantStats.wins += 1;
    } else if (outcome === "loss") {
      variantStats.losses += 1;
    } else if (outcome === "draw") {
      variantStats.draws += 1;
    }
    variantPerformanceMap.set(variantKey, variantStats);

    openingPerformanceMap.set(openingName, existing);
  });
  const openingPerformanceWithSamples = [...openingPerformanceMap.values()]
    .map((opening) => {
      const resolved = opening.wins + opening.draws + opening.losses;
      return {
        ...opening,
        successRate: resolved > 0 ? (opening.wins + opening.draws * 0.5) / resolved : 0,
      };
    })
    .sort((a, b) => b.games - a.games);
  const openingPerformance = openingPerformanceWithSamples.map(({ sampleLine, ...rest }) => rest);
  const variantPerformance = [...variantPerformanceMap.values()]
    .map((variant) => {
      const resolved = variant.wins + variant.draws + variant.losses;
      return {
        ...variant,
        successRate: resolved > 0 ? (variant.wins + variant.draws * 0.5) / resolved : 0,
      };
    })
    .sort((a, b) => b.games - a.games || b.successRate - a.successRate)
    .slice(0, 40);
  const gamesByMonth = [...gamesByMonthMap.values()]
    .filter((entry) => entry.month !== "unknown")
    .sort((a, b) => a.month.localeCompare(b.month));
  const unmappedOpenings = openingPerformanceWithSamples
    .filter((opening) => (
      opening.openingName === "Unknown" ||
      opening.mappedGames === 0 ||
      opening.manualReviewGames / Math.max(opening.games, 1) >= 0.5
    ))
    .sort((a, b) => b.games - a.games)
    .slice(0, 10)
    .map((opening) => ({
      openingName: opening.openingName,
      games: opening.games,
      manualReviewGames: opening.manualReviewGames,
      mappedGames: opening.mappedGames,
      successRate: opening.successRate,
      sampleLine: opening.sampleLine,
    }));
  const unusedRepertoires = repertoires
    .map((repertoire) => ({
      repertoireId: String(repertoire._id),
      repertoireName: String(repertoire.name || "Unnamed repertoire"),
      mappedGames: mappedByRepertoireId.get(String(repertoire._id)) || 0,
    }))
    .filter((repertoire) => repertoire.mappedGames === 0)
    .sort((a, b) => a.repertoireName.localeCompare(b.repertoireName))
    .slice(0, 12);
  return {
    totalGames,
    wins,
    draws,
    losses,
    winRate: totalGames > 0 ? (wins + draws * 0.5) / totalGames : 0,
    bySource: [...bySourceMap.entries()].map(([source, count]) => ({ source, count })),
    mappedToRepertoireCount,
    needsManualReviewCount,
    uniqueLines: uniqueLines.size,
    openingPerformance,
    variantPerformance,
    gamesByMonth,
    unmappedOpenings,
    unusedRepertoires,
    topOpenings: topOpenings(bucketed),
    linesToStudy: buildLinesToStudy(bucketed, variantTrainingByKey),
  };
}

const buildPriority = (line: LineStudyCandidate, weights: TrainingPlanWeights, repertoireGap: number): number => {
  const problem = Math.min(1, line.underperformanceScore + line.deviationRate * 0.5);
  const trainingErrorScore = Math.min(1, (line.trainingErrors || 0) / 4);
  return (
    weights.frequency * line.frequencyScore +
    weights.problem * (problem + trainingErrorScore * 0.6) +
    weights.recency * line.recencyScore +
    weights.repertoireGap * repertoireGap +
    weights.deviationRate * line.deviationRate
  );
};

const toTrainingStatsFilters = (filters?: ImportedGamesFilters): GameStatsFilters => ({
  source: filters?.source,
  color: filters?.color,
  dateFrom: filters?.dateFrom,
  dateTo: filters?.dateTo,
  timeControlBucket: filters?.timeControlBucket,
  openingQuery: filters?.openingQuery,
  mapped: filters?.mapped,
});

const hasActiveImportedFilters = (filters?: ImportedGamesFilters): boolean => Boolean(
  filters?.source
  || filters?.color
  || filters?.dateFrom
  || filters?.dateTo
  || filters?.timeControlBucket
  || filters?.openingQuery
  || (filters?.mapped && filters.mapped !== "all")
);

export async function generateTrainingPlan(
  userId: string,
  weights?: Partial<TrainingPlanWeights>,
  filters?: ImportedGamesFilters
): Promise<TrainingPlan> {
  const mergedWeights: TrainingPlanWeights = { ...DEFAULT_TRAINING_PLAN_WEIGHTS, ...weights };
  const stats = await getGamesStats(userId, toTrainingStatsFilters(filters));
  const db = getDB();
  const matchedLines = stats.linesToStudy.filter((line) => line.mappedGames > 0 && Boolean(line.variantName || line.repertoireName));
  const trainingErrorMatchedLines = matchedLines.filter((line) => (line.trainingErrors || 0) > 0);
  const prioritizedSource = trainingErrorMatchedLines.length > 0
    ? [...trainingErrorMatchedLines, ...matchedLines.filter((line) => (line.trainingErrors || 0) === 0)]
    : (matchedLines.length > 0 ? matchedLines : stats.linesToStudy);
  const seen = new Set<string>();
  const candidateLines = prioritizedSource.filter((line) => {
    if (seen.has(line.lineKey)) {
      return false;
    }
    seen.add(line.lineKey);
    return true;
  });

  const items = candidateLines.map((line) => {
    const repertoireGap = line.repertoireGapScore;
    const priority = buildPriority(line, mergedWeights, repertoireGap);
    return {
      lineKey: line.lineKey,
      openingName: line.openingName,
      variantName: line.variantName,
      repertoireName: line.repertoireName,
      movesSan: line.movesSan,
      priority,
      reasons: [
        (line.trainingErrors || 0) > 0 ? `${line.trainingErrors} outstanding training error${(line.trainingErrors || 0) > 1 ? "s" : ""} in this variant` : "",
        line.underperformanceScore > 0.4 ? `Win rate ${((1 - line.underperformanceScore) * 100).toFixed(0)}% in ${line.games} games` : "",
        line.frequencyScore > 0.4 ? "High frequency in your games" : "",
        line.recencyScore > 0.5 ? "Recently played line" : "",
        line.deviationRate > 0.3 ? `${line.manualReviewGames}/${line.games} games deviated early from repertoire` : "",
        line.repertoireGapScore > 0.45 ? "Weak repertoire coverage confidence" : "",
      ].filter(Boolean),
      effort: (priority > 0.7 ? "high" : priority > 0.4 ? "medium" : "low") as "high" | "medium" | "low",
      tasks: line.suggestedTasks,
      games: line.games,
      wins: line.wins,
      draws: line.draws,
      losses: line.losses,
      mappedGames: line.mappedGames,
      manualReviewGames: line.manualReviewGames,
      deviationRate: line.deviationRate,
      trainingErrors: line.trainingErrors,
      trainingDueAt: line.trainingDueAt,
      trainingLastReviewedAt: line.trainingLastReviewedAt,
      done: false,
    };
  }).sort((a, b) => b.priority - a.priority);

  const plan: TrainingPlan = {
    id: new ObjectId().toString(),
    generatedAt: new Date().toISOString(),
    weights: mergedWeights,
    items,
  };

  const doc: TrainingPlanDocument = {
    ...plan,
    userId,
    generatedAtDate: new Date(plan.generatedAt),
  };
  await db.collection<TrainingPlanDocument>("trainingPlans").insertOne(doc);
  return plan;
}

export async function getLatestTrainingPlan(userId: string, filters?: ImportedGamesFilters): Promise<TrainingPlan | null> {
  const db = getDB();
  const plan = await db.collection<TrainingPlanDocument>("trainingPlans").findOne({ userId }, { sort: { generatedAtDate: -1 } });
  if (!plan) {
    return null;
  }
  const stats = await getGamesStats(userId, toTrainingStatsFilters(filters));
  const lineByKey = new Map(stats.linesToStudy.map((line) => [line.lineKey, line]));
  const hydratedItems = plan.items.map((item) => {
    const line = lineByKey.get(item.lineKey);
    const priority = typeof item.priority === "number" ? item.priority : 0;
    return {
      ...item,
      openingName: item.openingName && item.openingName !== "Unknown" ? item.openingName : (line?.openingName || "Unknown"),
      variantName: item.variantName || line?.variantName,
      repertoireName: item.repertoireName || line?.repertoireName,
      reasons: Array.isArray(item.reasons) ? item.reasons : [],
      tasks: Array.isArray(item.tasks) ? item.tasks : [],
      effort: item.effort || (priority > 0.7 ? "high" : priority > 0.4 ? "medium" : "low"),
      games: typeof item.games === "number" ? item.games : (line?.games || 0),
      wins: typeof item.wins === "number" ? item.wins : (line?.wins || 0),
      draws: typeof item.draws === "number" ? item.draws : (line?.draws || 0),
      losses: typeof item.losses === "number" ? item.losses : (line?.losses || 0),
      mappedGames: typeof item.mappedGames === "number" ? item.mappedGames : (line?.mappedGames || 0),
      manualReviewGames: typeof item.manualReviewGames === "number" ? item.manualReviewGames : (line?.manualReviewGames || 0),
      deviationRate: typeof item.deviationRate === "number" ? item.deviationRate : (line?.deviationRate || 0),
      trainingErrors: typeof item.trainingErrors === "number" ? item.trainingErrors : (line?.trainingErrors || 0),
      trainingDueAt: item.trainingDueAt || line?.trainingDueAt,
      trainingLastReviewedAt: item.trainingLastReviewedAt || line?.trainingLastReviewedAt,
      done: Boolean(item.done),
    };
  });
  const items = hasActiveImportedFilters(filters)
    ? hydratedItems.filter((item) => lineByKey.has(item.lineKey))
    : hydratedItems;
  return {
    id: plan.id,
    generatedAt: plan.generatedAt,
    weights: plan.weights,
    items,
  };
}

export async function markTrainingPlanItemDone(userId: string, planId: string, lineKey: string, done: boolean): Promise<void> {
  const db = getDB();
  await db.collection<TrainingPlanDocument>("trainingPlans").updateOne(
    { userId, id: planId, "items.lineKey": lineKey },
    { $set: { "items.$.done": done } }
  );
}

const getAutoSyncDueHours = (): number => {
  const value = Number(process.env.GAMES_AUTO_SYNC_DUE_HOURS || 24);
  if (!Number.isFinite(value) || value <= 0) {
    return 24;
  }
  return value;
};

export async function runAutoSyncForDueAccounts(maxAccounts = 25): Promise<void> {
  const db = getDB();
  const dueBefore = new Date(Date.now() - getAutoSyncDueHours() * 60 * 60 * 1000);
  const dueAccounts = await db.collection<LinkedGameAccountDocument>("linkedGameAccounts")
    .find({
      provider: { $in: ["lichess", "chesscom"] },
      status: { $ne: "running" },
      $or: [
        { lastSyncAt: { $exists: false } },
        { lastSyncAt: { $lte: dueBefore } },
      ],
    })
    .limit(maxAccounts)
    .toArray();

  for (const account of dueAccounts) {
    try {
      await importGamesForUser(account.userId, { source: account.provider });
    } catch (error) {
      console.error("Auto-sync failed", {
        userId: account.userId,
        provider: account.provider,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
