import { Request, Response, NextFunction } from "express";
import { determineBestPath } from "../services/pathService";

export async function getPaths(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await determineBestPath();
    res.json(result);
  } catch (err) {
    next(err);
  }
}
