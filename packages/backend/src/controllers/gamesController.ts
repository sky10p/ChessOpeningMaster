import { NextFunction, Request, Response } from "express";
import { getRequestUserId } from "../utils/requestUser";
import {
  clearImportedGames,
  deleteImportedGame,
  disconnectLinkedAccount,
  generateTrainingPlan,
  getGamesStats,
  getLatestTrainingPlan,
  ImportedGamesFilters,
  importGamesForUser,
  listImportedGames,
  listLinkedAccounts,
  markTrainingPlanItemDone,
  upsertLinkedAccount,
} from "../services/games/gameImportService";

const parseImportedGamesFilters = (req: Request): ImportedGamesFilters => {
  const source = req.query.source === "lichess" || req.query.source === "chesscom" || req.query.source === "manual"
    ? req.query.source
    : undefined;
  const color = req.query.color === "white" || req.query.color === "black"
    ? req.query.color
    : undefined;
  const mapped = req.query.mapped === "mapped" || req.query.mapped === "unmapped" || req.query.mapped === "all"
    ? req.query.mapped
    : undefined;
  const timeControlBucket =
    req.query.timeControlBucket === "bullet" || req.query.timeControlBucket === "blitz" || req.query.timeControlBucket === "rapid" || req.query.timeControlBucket === "classical"
      ? req.query.timeControlBucket
      : undefined;
  return {
    source,
    color,
    dateFrom: typeof req.query.dateFrom === "string" ? req.query.dateFrom : undefined,
    dateTo: typeof req.query.dateTo === "string" ? req.query.dateTo : undefined,
    timeControlBucket,
    openingQuery: typeof req.query.openingQuery === "string" ? req.query.openingQuery : undefined,
    mapped,
  };
};

export async function getLinkedAccounts(req: Request, res: Response, next: NextFunction) {
  try {
    const accounts = await listLinkedAccounts(getRequestUserId(req));
    res.json(accounts);
  } catch (error) {
    next(error);
  }
}

export async function postLinkedAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const provider = req.body?.provider;
    const username = typeof req.body?.username === "string" ? req.body.username.trim() : "";
    const token = typeof req.body?.token === "string" ? req.body.token.trim() : undefined;
    if ((provider !== "lichess" && provider !== "chesscom") || !username) {
      return res.status(400).json({ message: "provider and username are required" });
    }
    const account = await upsertLinkedAccount(getRequestUserId(req), provider, username, token);
    res.status(201).json(account);
  } catch (error) {
    next(error);
  }
}

export async function deleteLinkedAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const provider = req.params.provider;
    if (provider !== "lichess" && provider !== "chesscom") {
      return res.status(400).json({ message: "invalid provider" });
    }
    await disconnectLinkedAccount(getRequestUserId(req), provider);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function postImportGames(req: Request, res: Response, next: NextFunction) {
  try {
    const source = req.body?.source;
    if (source !== "lichess" && source !== "chesscom" && source !== "manual") {
      return res.status(400).json({ message: "invalid source" });
    }
    const summary = await importGamesForUser(getRequestUserId(req), {
      source,
      username: typeof req.body?.username === "string" ? req.body.username.trim() : undefined,
      token: typeof req.body?.token === "string" ? req.body.token.trim() : undefined,
      pgn: typeof req.body?.pgn === "string" ? req.body.pgn : undefined,
      tournamentGroup: typeof req.body?.tournamentGroup === "string" ? req.body.tournamentGroup : undefined,
      tags: Array.isArray(req.body?.tags) ? req.body.tags.filter((tag: unknown) => typeof tag === "string") : undefined,
    });
    res.status(200).json(summary);
  } catch (error) {
    next(error);
  }
}

export async function getImportedGames(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = Number(req.query.limit);
    const games = await listImportedGames(
      getRequestUserId(req),
      Number.isFinite(limit) ? limit : 100,
      parseImportedGamesFilters(req)
    );
    res.json(games);
  } catch (error) {
    next(error);
  }
}

export async function deleteImportedGameById(req: Request, res: Response, next: NextFunction) {
  try {
    const gameId = req.params.gameId;
    const deleted = await deleteImportedGame(getRequestUserId(req), gameId);
    if (!deleted) {
      return res.status(404).json({ message: "Game not found" });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function deleteImportedGames(req: Request, res: Response, next: NextFunction) {
  try {
    const deletedCount = await clearImportedGames(getRequestUserId(req), parseImportedGamesFilters(req));
    res.json({ deletedCount });
  } catch (error) {
    next(error);
  }
}

export async function getGamesStatsSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const importedFilters = parseImportedGamesFilters(req);
    const stats = await getGamesStats(getRequestUserId(req), {
      dateFrom: typeof req.query.dateFrom === "string" ? req.query.dateFrom : undefined,
      dateTo: typeof req.query.dateTo === "string" ? req.query.dateTo : undefined,
      timeControlBucket:
        req.query.timeControlBucket === "bullet" || req.query.timeControlBucket === "blitz" || req.query.timeControlBucket === "rapid" || req.query.timeControlBucket === "classical"
          ? req.query.timeControlBucket
          : undefined,
      ratedOnly: req.query.ratedOnly === "true",
      color: req.query.color === "white" || req.query.color === "black" ? req.query.color : undefined,
      source: importedFilters.source,
      openingQuery: importedFilters.openingQuery,
      mapped: importedFilters.mapped,
      opponentRatingBand: typeof req.query.opponentRatingBand === "string" ? req.query.opponentRatingBand : undefined,
      tournamentGroup: typeof req.query.tournamentGroup === "string" ? req.query.tournamentGroup : undefined,
    });
    res.json(stats);
  } catch (error) {
    next(error);
  }
}

export async function postGenerateTrainingPlan(req: Request, res: Response, next: NextFunction) {
  try {
    const plan = await generateTrainingPlan(getRequestUserId(req), req.body?.weights);
    res.status(201).json(plan);
  } catch (error) {
    next(error);
  }
}

export async function getTrainingPlan(req: Request, res: Response, next: NextFunction) {
  try {
    const plan = await getLatestTrainingPlan(getRequestUserId(req));
    if (!plan) {
      return res.status(404).json({ message: "No training plan generated" });
    }
    res.json(plan);
  } catch (error) {
    next(error);
  }
}

export async function patchTrainingPlanItem(req: Request, res: Response, next: NextFunction) {
  try {
    const planId = req.params.planId;
    const lineKey = req.params.lineKey;
    const done = Boolean(req.body?.done);
    await markTrainingPlanItemDone(getRequestUserId(req), planId, lineKey, done);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
