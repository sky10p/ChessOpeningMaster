import { Request, Response, NextFunction } from "express";
import { determineBestPath } from "../services/pathService";
import { PathCategory } from "@chess-opening-master/common/src/types/Path";
import { getRequestUserId } from "../utils/requestUser";

export async function getPaths(req: Request, res: Response, next: NextFunction) {
  try {
    const category = req.query.category as PathCategory | undefined;
    const result = await determineBestPath(getRequestUserId(req), category);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
