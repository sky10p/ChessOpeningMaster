import { Request, Response, NextFunction } from "express";
import { determineBestPath, getPathAnalytics, getPathPlan, PathInsightsFilters } from "../services/pathService";
import { PathCategory, PathSelectionFilters } from "@chess-opening-master/common";
import { getRequestUserId } from "../utils/requestUser";

export async function getPaths(req: Request, res: Response, next: NextFunction) {
  try {
    const category = req.query.category as PathCategory | undefined;
    const orientation =
      req.query.orientation === "white" || req.query.orientation === "black"
        ? req.query.orientation
        : undefined;
    const filters: PathSelectionFilters = {
      orientation,
      openingName: typeof req.query.openingName === "string" ? req.query.openingName : undefined,
      fen: typeof req.query.fen === "string" ? req.query.fen : undefined,
    };
    const result = await determineBestPath(getRequestUserId(req), category, filters);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

function getInsightsFilters(req: Request): PathInsightsFilters {
  const orientation =
    req.query.orientation === "white" || req.query.orientation === "black"
      ? req.query.orientation
      : undefined;
  const dailyNewLimitRaw = Number(req.query.dailyNewLimit);
  return {
    orientation,
    openingName: typeof req.query.openingName === "string" ? req.query.openingName : undefined,
    fen: typeof req.query.fen === "string" ? req.query.fen : undefined,
    dateFrom: typeof req.query.dateFrom === "string" ? req.query.dateFrom : undefined,
    dateTo: typeof req.query.dateTo === "string" ? req.query.dateTo : undefined,
    dailyNewLimit: Number.isFinite(dailyNewLimitRaw) ? dailyNewLimitRaw : undefined,
  };
}

export async function getPathPlanSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await getPathPlan(getRequestUserId(req), getInsightsFilters(req));
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getPathAnalyticsSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await getPathAnalytics(getRequestUserId(req), getInsightsFilters(req));
    res.json(result);
  } catch (err) {
    next(err);
  }
}
