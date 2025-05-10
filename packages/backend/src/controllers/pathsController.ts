import { Request, Response, NextFunction } from "express";
import { determineBestPath } from "../services/pathService";
import { PathCategory } from "@chess-opening-master/common/src/types/Path";

export async function getPaths(req: Request, res: Response, next: NextFunction) {
  try {
    const category = req.query.category as PathCategory | undefined;
    const result = await determineBestPath(category);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
