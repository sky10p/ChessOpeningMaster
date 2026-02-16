import { ObjectId } from "mongodb";
import {
  GameStatsFilters,
  GamesStatsSummary,
  ImportSummary,
  ImportedGame,
  LinkedGameAccount,
  LineStudyCandidate,
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
import { buildFallbackDedupeKey, detectOpening, inferOrientation, toNormalizedResult } from "./pgnProcessing";

interface ProviderImportInput {
  source: "lichess" | "chesscom" | "manual";
  username?: string;
  token?: string;
  pgn?: string;
  tournamentGroup?: string;
  tags?: string[];
}

const mapAccount = (doc: LinkedGameAccountDocument & { _id: ObjectId }): LinkedGameAccount => ({
  id: doc._id.toString(),
  provider: doc.provider,
  username: doc.username,
  connectedAt: doc.connectedAt.toISOString(),
  lastSyncAt: doc.lastSyncAt?.toISOString(),
  status: doc.status,
  lastError: doc.lastError,
});

const mapImportedGame = (doc: ImportedGameDocument & { _id: ObjectId }): ImportedGame => ({
  id: doc._id.toString(),
  source: doc.source,
  providerGameId: doc.providerGameId,
  white: doc.white,
  black: doc.black,
  whiteRating: doc.whiteRating,
  blackRating: doc.blackRating,
  result: doc.result,
  timeControl: doc.timeControl,
  rated: doc.rated,
  playedAt: doc.playedAt?.toISOString(),
  pgn: doc.pgn,
  movesSan: doc.movesSan,
  orientation: doc.orientation,
  tournamentGroup: doc.tournamentGroup,
  tags: doc.tags,
});

const getMainLineSan = (moveNodes: unknown, maxPlies: number): string[] => {
  const result: string[] = [];
  let node = moveNodes as { children?: Array<{ move?: { san?: string }; children?: unknown[] }> };
  while (node && Array.isArray(node.children) && node.children[0] && result.length < maxPlies) {
    const first = node.children[0] as { move?: { san?: string }; children?: unknown[] };
    if (!first.move?.san) {
      break;
    }
    result.push(first.move.san);
    node = first as unknown as { children?: Array<{ move?: { san?: string }; children?: unknown[] }> };
  }
  return result;
};

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

const toTimeControlBucket = (value?: string): "bullet" | "blitz" | "rapid" | "classical" | undefined => {
  if (!value) {
    return undefined;
  }
  const raw = value.split("+")[0];
  const seconds = Number(raw);
  if (!Number.isFinite(seconds)) {
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

async function buildOpeningMapping(userId: string, openingName: string | undefined, eco: string | undefined, lineMovesSan: string[], tags?: string[]): Promise<OpeningMapping> {
  const db = getDB();
  const repertoires = await db.collection("repertoires").find({ userId }).project({ _id: 1, name: 1, moveNodes: 1 }).toArray();
  let best: OpeningMapping = { confidence: 0, strategy: "none", requiresManualReview: true };

  repertoires.forEach((repertoire) => {
    const repName = String(repertoire.name || "");
    const repLine = getMainLineSan(repertoire.moveNodes, 12);
    if (eco && repName.toLowerCase().includes(eco.toLowerCase())) {
      const candidate: OpeningMapping = {
        repertoireId: repertoire._id.toString(),
        repertoireName: repName,
        confidence: 0.92,
        strategy: "eco",
        requiresManualReview: false,
      };
      if (candidate.confidence > best.confidence) {
        best = candidate;
      }
    }
    if (repLine.length > 0 && lineMovesSan.length > 0) {
      const overlap = repLine.filter((move, index) => lineMovesSan[index] === move).length;
      const ratio = overlap / Math.max(Math.min(repLine.length, lineMovesSan.length), 1);
      if (ratio > best.confidence) {
        best = {
          repertoireId: repertoire._id.toString(),
          repertoireName: repName,
          confidence: ratio,
          strategy: "movePrefix",
          requiresManualReview: ratio < 0.75,
        };
      }
    }
    const fuzzy = nameSimilarity(openingName || "", repName);
    if (fuzzy > best.confidence) {
      best = {
        repertoireId: repertoire._id.toString(),
        repertoireName: repName,
        confidence: fuzzy,
        strategy: "fuzzyName",
        requiresManualReview: fuzzy < 0.75,
      };
    }
    const tagScore = tags?.some((tag) => repName.toLowerCase().includes(tag.toLowerCase())) ? 0.76 : 0;
    if (tagScore > best.confidence) {
      best = {
        repertoireId: repertoire._id.toString(),
        repertoireName: repName,
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
        connectedAt: now,
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
  const now = new Date();

  const setAccountStatus = async (provider: "lichess" | "chesscom", status: "running" | "failed" | "completed", lastError?: string) => {
    await accountsCollection.updateOne(
      { userId, provider },
      { $set: { status, lastError, ...(status === "completed" ? { lastSyncAt: now } : {}) } }
    );
  };

  const linked = input.source === "manual" ? null : await accountsCollection.findOne({ userId, provider: input.source });
  const username = input.username || linked?.username;
  const token = input.token || decryptSecret(linked?.tokenEncrypted);

  try {
    if (input.source !== "manual") {
      await setAccountStatus(input.source, "running");
    }

    const providerGames =
      input.source === "manual"
        ? (await manualPgnProvider.importGames(input.pgn || "")).map((game) => ({ ...game, providerGameId: undefined }))
        : input.source === "lichess"
          ? await lichessProvider.importGames({ username: username || "", token, since: linked?.lastSyncAt, max: 250 })
          : await chessComProvider.importGames({ username: username || "", since: linked?.lastSyncAt, max: 250 });

    for (const game of providerGames) {
      try {
        const white = game.headers.White || "Unknown";
        const black = game.headers.Black || "Unknown";
        const playedAt = parseDateHeader(game.headers.UTCDate || game.headers.Date);
        const dedupeKey = game.providerGameId
          ? `${input.source}:${game.providerGameId}`
          : buildFallbackDedupeKey(playedAt?.toISOString(), white, black, game.headers.Result, game.movesSan);
        const alreadyExists = await gamesCollection.findOne({ userId, dedupeKey }, { projection: { _id: 1 } });
        if (alreadyExists) {
          duplicateCount += 1;
          continue;
        }

        const openingDetection = detectOpening(game.headers, game.movesSan);
        const openingMapping = await buildOpeningMapping(userId, openingDetection.openingName, openingDetection.eco, openingDetection.lineMovesSan, input.tags);
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
          rated: game.headers.Rated ? game.headers.Rated.toLowerCase() === "true" : undefined,
          playedAt,
          pgn: game.pgn,
          movesSan: game.movesSan,
          orientation: inferOrientation(username, white, black),
          tournamentGroup: input.tournamentGroup,
          tags: input.tags,
          openingDetection,
          openingMapping,
          createdAt: now,
        };
        await gamesCollection.insertOne(doc);
        importedCount += 1;
      } catch {
        failedCount += 1;
      }
    }

    if (input.source !== "manual") {
      await setAccountStatus(input.source, "completed");
    }
  } catch (error) {
    if (input.source !== "manual") {
      await setAccountStatus(input.source, "failed", error instanceof Error ? error.message : "Import failed");
    }
    throw error;
  }

  return {
    importedCount,
    duplicateCount,
    failedCount,
    statsRefreshedAt: now.toISOString(),
  };
}

export async function listImportedGames(userId: string, limit = 100): Promise<ImportedGame[]> {
  const db = getDB();
  const docs = await db.collection<ImportedGameDocument>("importedGames").find({ userId }).sort({ playedAt: -1, createdAt: -1 }).limit(limit).toArray();
  return docs.map((doc) => mapImportedGame({ ...doc, _id: doc._id as unknown as ObjectId }));
}

const buildStatsFilter = (userId: string, filters: GameStatsFilters): Record<string, unknown> => {
  const filter: Record<string, unknown> = { userId };
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
  return filter;
};

const computeResults = (games: ImportedGameDocument[]) => {
  let wins = 0;
  let draws = 0;
  let losses = 0;
  games.forEach((game) => {
    if (game.orientation === "white") {
      if (game.result === "1-0") wins += 1;
      else if (game.result === "0-1") losses += 1;
      else if (game.result === "1/2-1/2") draws += 1;
      return;
    }
    if (game.orientation === "black") {
      if (game.result === "0-1") wins += 1;
      else if (game.result === "1-0") losses += 1;
      else if (game.result === "1/2-1/2") draws += 1;
      return;
    }
    if (game.result === "1/2-1/2") {
      draws += 1;
    }
  });
  return { wins, draws, losses };
};

const topOpenings = (games: ImportedGameDocument[]): Array<{ openingName: string; count: number }> => {
  const counts = new Map<string, number>();
  games.forEach((game) => {
    const openingName = game.openingDetection.openingName || "Unknown";
    counts.set(openingName, (counts.get(openingName) || 0) + 1);
  });
  return [...counts.entries()].map(([openingName, count]) => ({ openingName, count })).sort((a, b) => b.count - a.count).slice(0, 10);
};

const buildLinesToStudy = (games: ImportedGameDocument[]): LineStudyCandidate[] => {
  const grouped = new Map<string, ImportedGameDocument[]>();
  games.forEach((game) => {
    const key = game.openingDetection.lineKey;
    grouped.set(key, [...(grouped.get(key) || []), game]);
  });
  const now = Date.now();
  return [...grouped.entries()].map(([lineKey, lineGames]) => {
    const { wins, draws, losses } = computeResults(lineGames);
    const total = lineGames.length;
    const winRate = total > 0 ? (wins + draws * 0.5) / total : 0;
    const underperformanceScore = 1 - winRate;
    const recentTs = Math.max(...lineGames.map((game) => game.playedAt?.getTime() || 0));
    const recencyScore = recentTs ? Math.max(0, 1 - (now - recentTs) / (1000 * 60 * 60 * 24 * 60)) : 0;
    const frequencyScore = Math.min(1, total / 10);
    const deviationRate = lineGames.filter((game) => game.openingMapping.requiresManualReview).length / total;
    return {
      lineKey,
      eco: lineGames[0].openingDetection.eco,
      openingName: lineGames[0].openingDetection.openingName || "Unknown",
      movesSan: lineGames[0].openingDetection.lineMovesSan,
      sampleGameIds: lineGames.slice(0, 3).map((game) => String(game._id || "")),
      games: total,
      wins,
      draws,
      losses,
      deviationRate,
      underperformanceScore,
      recencyScore,
      frequencyScore,
      suggestedTasks: [
        "Review main line",
        `Drill line to ply ${Math.min(12, lineGames[0].openingDetection.lineMovesSan.length)}`,
        "Practice with constrained sparring game",
      ],
    };
  }).filter((line) => line.underperformanceScore > 0.35 || line.frequencyScore > 0.35 || line.recencyScore > 0.5 || line.deviationRate > 0.3)
    .sort((a, b) => (b.underperformanceScore + b.frequencyScore + b.recencyScore + b.deviationRate) - (a.underperformanceScore + a.frequencyScore + a.recencyScore + a.deviationRate))
    .slice(0, 12);
};

export async function getGamesStats(userId: string, filters: GameStatsFilters): Promise<GamesStatsSummary> {
  const db = getDB();
  const collection = db.collection<ImportedGameDocument>("importedGames");
  const allGames = await collection.find(buildStatsFilter(userId, filters)).toArray();
  const bucketed = filters.timeControlBucket ? allGames.filter((game) => toTimeControlBucket(game.timeControl) === filters.timeControlBucket) : allGames;
  const { wins, draws, losses } = computeResults(bucketed);
  const totalGames = bucketed.length;
  return {
    totalGames,
    wins,
    draws,
    losses,
    winRate: totalGames > 0 ? (wins + draws * 0.5) / totalGames : 0,
    topOpenings: topOpenings(bucketed),
    linesToStudy: buildLinesToStudy(bucketed),
  };
}

const buildPriority = (line: LineStudyCandidate, weights: TrainingPlanWeights, repertoireGap: number): number => {
  const problem = Math.min(1, line.underperformanceScore + line.deviationRate * 0.5);
  return (
    weights.frequency * line.frequencyScore +
    weights.problem * problem +
    weights.recency * line.recencyScore +
    weights.repertoireGap * repertoireGap +
    weights.deviationRate * line.deviationRate
  );
};

export async function generateTrainingPlan(userId: string, weights?: Partial<TrainingPlanWeights>): Promise<TrainingPlan> {
  const mergedWeights: TrainingPlanWeights = { ...DEFAULT_TRAINING_PLAN_WEIGHTS, ...weights };
  const stats = await getGamesStats(userId, {});
  const db = getDB();
  const items = stats.linesToStudy.map((line) => {
    const repertoireGap = line.deviationRate;
    const priority = buildPriority(line, mergedWeights, repertoireGap);
    return {
      lineKey: line.lineKey,
      openingName: line.openingName,
      movesSan: line.movesSan,
      priority,
      reasons: [
        line.underperformanceScore > 0.4 ? "Underperforming line" : "",
        line.frequencyScore > 0.4 ? "High frequency in your games" : "",
        line.recencyScore > 0.5 ? "Recently played" : "",
        line.deviationRate > 0.3 ? "Early deviations from repertoire" : "",
      ].filter(Boolean),
      effort: (priority > 0.7 ? "high" : priority > 0.4 ? "medium" : "low") as "high" | "medium" | "low",
      tasks: line.suggestedTasks,
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

export async function getLatestTrainingPlan(userId: string): Promise<TrainingPlan | null> {
  const db = getDB();
  const plan = await db.collection<TrainingPlanDocument>("trainingPlans").findOne({ userId }, { sort: { generatedAtDate: -1 } });
  if (!plan) {
    return null;
  }
  return {
    id: plan.id,
    generatedAt: plan.generatedAt,
    weights: plan.weights,
    items: plan.items,
  };
}

export async function markTrainingPlanItemDone(userId: string, planId: string, lineKey: string, done: boolean): Promise<void> {
  const db = getDB();
  await db.collection<TrainingPlanDocument>("trainingPlans").updateOne(
    { userId, id: planId, "items.lineKey": lineKey },
    { $set: { "items.$.done": done } }
  );
}
