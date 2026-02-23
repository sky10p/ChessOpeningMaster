import { NextFunction, Request, Response } from "express";
import { getRequestUserId } from "../utils/requestUser";
import { getTrainOpening, getTrainOverview } from "../services/trainService";

export async function getTrainOverviewSummary(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const summary = await getTrainOverview(getRequestUserId(req));
    res.status(200).json(summary);
  } catch (err) {
    next(err);
  }
}

export async function getTrainOpeningSummary(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const repertoireId = req.params.id;
    const openingName = decodeURIComponent(req.params.openingName || "").trim();
    if (!openingName) {
      return res.status(400).json({ message: "openingName is required" });
    }
    const result = await getTrainOpening(
      getRequestUserId(req),
      repertoireId,
      openingName
    );
    if (!result) {
      return res.status(404).json({ message: "Train opening not found" });
    }
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
