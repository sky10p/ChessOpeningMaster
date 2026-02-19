import { AccountSyncFeedback, BoardOrientation, ImportSummary } from "@chess-opening-master/common";
import { getDB } from "../../db/mongo";
import { ImportedGameDocument, LinkedGameAccountDocument } from "../../models/GameImport";
import { decryptSecret } from "./security";
import { chessComProvider } from "./providers/chessComProvider";
import { lichessProvider } from "./providers/lichessProvider";
import { manualPgnProvider } from "./providers/manualPgnProvider";
import { buildFallbackDedupeKey, detectOpening, inferOrientation, toNormalizedResult } from "./pgnProcessing";
import { ImportBatchCache, RepertoireMetadata, RepertoireMetadataCacheKey } from "./gameImportTypes";
import { buildOpeningMapping as buildOpeningMappingService } from "./openingMappingService";
import { toTimeControlBucket } from "./gameTimeControlService";

export interface ProviderImportInput {
  source: "lichess" | "chesscom" | "manual";
  username?: string;
  token?: string;
  pgn?: string;
  tournamentGroup?: string;
  tags?: string[];
}

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
) {
  return buildOpeningMappingService(userId, orientation, openingName, eco, lineMovesSan, tags, importBatchCache);
}

export async function importGamesForUserInternal(userId: string, input: ProviderImportInput): Promise<ImportSummary> {
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

export const importGamesForUserOrchestrated = importGamesForUserInternal;
