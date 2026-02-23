import { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../db/mongo";
import { getRequestUserId } from "../utils/requestUser";
import AdmZip from "adm-zip";
import { inferSuggestedRatingFromLegacyErrors, parseReviewRating } from "../services/spacedRepetitionService";
import { saveVariantReview } from "../services/variantReviewService";
import {
  getVariantMistakesForRepertoire,
  reviewVariantMistake,
} from "../services/variantMistakeService";
import { MistakeSnapshotItem } from "@chess-opening-master/common";

const getUserFilter = (req: Request) => ({ userId: getRequestUserId(req) });

function parseMistakeSnapshotPayload(value: unknown): MistakeSnapshotItem[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const parsed: MistakeSnapshotItem[] = [];
  value.forEach((raw) => {
    if (!raw || typeof raw !== "object") {
      return;
    }
    const candidate = raw as Record<string, unknown>;
    if (
      typeof candidate.mistakeKey !== "string" ||
      typeof candidate.positionFen !== "string" ||
      typeof candidate.expectedMoveLan !== "string"
    ) {
      return;
    }
    parsed.push({
      mistakeKey: candidate.mistakeKey,
      mistakePly: Number.isFinite(candidate.mistakePly)
        ? Number(candidate.mistakePly)
        : 1,
      variantStartPly: Number.isFinite(candidate.variantStartPly)
        ? Number(candidate.variantStartPly)
        : 0,
      positionFen: candidate.positionFen,
      expectedMoveLan: candidate.expectedMoveLan,
      expectedMoveSan:
        typeof candidate.expectedMoveSan === "string"
          ? candidate.expectedMoveSan
          : undefined,
      actualMoveLan:
        typeof candidate.actualMoveLan === "string"
          ? candidate.actualMoveLan
          : undefined,
    });
  });
  return parsed;
}

type VariantInfoDocument = {
  _id: ObjectId;
  userId: string;
  repertoireId: string;
  variantName: string;
  errors: number;
  lastDate: Date;
};

export async function getRepertoires(req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDB();
    const repertoires = await db
      .collection("repertoires")
      .find(getUserFilter(req))
      .sort({ order: 1 })
      .project({ name: 1, _id: 1 })
      .toArray();
    res.json(repertoires);
  } catch (err) {
    next(err);
  }
}

export async function getFullRepertoires(req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDB();
    const userId = getRequestUserId(req);
    const repertoires = await db.collection("repertoires").find({ userId }).sort({ order: 1 }).toArray();

    if (repertoires.length === 0) {
      return res.json([]);
    }

    const repertoireIds = repertoires.map((repertoire) => repertoire._id.toString());
    const variantsInfo = (await db
      .collection("variantsInfo")
      .find({ userId, repertoireId: { $in: repertoireIds } })
      .toArray()) as VariantInfoDocument[];

    const variantsInfoByRepertoireId = new Map<string, VariantInfoDocument[]>();
    variantsInfo.forEach((variantInfo) => {
      const currentVariantsInfo = variantsInfoByRepertoireId.get(variantInfo.repertoireId) || [];
      currentVariantsInfo.push(variantInfo);
      variantsInfoByRepertoireId.set(variantInfo.repertoireId, currentVariantsInfo);
    });

    const fullRepertoires = repertoires.map((repertoire) => ({
      ...repertoire,
      variantsInfo: variantsInfoByRepertoireId.get(repertoire._id.toString()) || [],
    }));

    res.json(fullRepertoires);
  } catch (err) {
    next(err);
  }
}

export async function downloadRepertoires(req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDB();
    const userFilter = getUserFilter(req);
    const repertoires = await db.collection("repertoires").find(userFilter).sort({ order: 1 }).toArray();
    const studies = await db.collection("studies").find(userFilter).toArray();
    const variantsInfo = await db.collection("variantsInfo").find(userFilter).toArray();

    const zip = new AdmZip();
    zip.addFile("repertoires.json", Buffer.from(JSON.stringify(repertoires, null, 2)));
    zip.addFile("studies.json", Buffer.from(JSON.stringify(studies, null, 2)));
    zip.addFile("variantsInfo.json", Buffer.from(JSON.stringify(variantsInfo, null, 2)));

    const today = new Date().toISOString().split("T")[0];
    const zipFileName = `chess-openings-backup-${today}.zip`;

    res.setHeader("Content-disposition", `attachment; filename=${zipFileName}`);
    res.setHeader("Content-type", "application/zip");
    res.send(zip.toBuffer());
  } catch (err) {
    next(err);
  }
}

export async function getRepertoireById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const db = getDB();
    const repertoire = await db.collection("repertoires").findOne({ _id: new ObjectId(id), ...getUserFilter(req) });
    res.json(repertoire);
  } catch (err) {
    next(err);
  }
}

export async function downloadRepertoireById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const db = getDB();
    const repertoire = await db.collection("repertoires").findOne({ _id: new ObjectId(id), ...getUserFilter(req) });
    if (!repertoire) {
      return res.status(404).json({ message: "Repertoire not found" });
    }
    res.setHeader("Content-disposition", `attachment; filename=${repertoire.name}.json`);
    res.setHeader("Content-type", "application/json");
    res.write(JSON.stringify(repertoire));
    res.end();
  } catch (err) {
    next(err);
  }
}

export async function createRepertoire(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, orientation, moveNodes } = req.body;
    const db = getDB();
    const highestOrderRepertoire = await db.collection("repertoires").findOne(getUserFilter(req), { sort: { order: -1 } });
    const order = highestOrderRepertoire ? highestOrderRepertoire.order + 1 : 1;
    const repertoire = await db.collection("repertoires").insertOne({ name, moveNodes, orientation, order, ...getUserFilter(req) });
    res.json(repertoire);
  } catch (err) {
    next(err);
  }
}

export async function duplicateRepertoire(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const db = getDB();
    const highestOrderRepertoire = await db.collection("repertoires").findOne(getUserFilter(req), { sort: { order: -1 } });
    const order = highestOrderRepertoire ? highestOrderRepertoire.order + 1 : 1;
    const repertoire = await db.collection("repertoires").findOne({ _id: new ObjectId(id), ...getUserFilter(req) });
    const repertoireWithoutId = { ...repertoire, _id: undefined };
    const newRepertoire = await db.collection("repertoires").insertOne({ ...repertoireWithoutId, name, order, ...getUserFilter(req) });
    res.json(newRepertoire);
  } catch (err) {
    next(err);
  }
}

export async function getVariantsInfo(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const db = getDB();
    const variantsInfo = await db.collection("variantsInfo").find({ repertoireId: id, ...getUserFilter(req) }).toArray();
    res.json(variantsInfo);
  } catch (err) {
    next(err);
  }
}

export async function postVariantsInfo(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const variantName = typeof req.body?.variantName === "string" ? req.body.variantName.trim() : "";
    const legacyErrors = Number.isFinite(req.body?.errors) ? Math.max(0, Math.floor(req.body.errors)) : 0;
    if (!variantName) {
      return res.status(400).json({ message: "variantName is required" });
    }
    const suggestedRating = inferSuggestedRatingFromLegacyErrors(legacyErrors);
    const parsedRating = parseReviewRating(req.body?.rating);
    const rating = parsedRating || suggestedRating;
    const result = await saveVariantReview({
      userId: getRequestUserId(req),
      repertoireId: id,
      variantName,
      rating,
      suggestedRating,
      acceptedSuggested: rating === suggestedRating,
      wrongMoves: legacyErrors,
      ignoredWrongMoves: Number.isFinite(req.body?.ignoredWrongMoves) ? req.body.ignoredWrongMoves : 0,
      hintsUsed: Number.isFinite(req.body?.hintsUsed) ? req.body.hintsUsed : 0,
      timeSpentSec: Number.isFinite(req.body?.timeSpentSec) ? req.body.timeSpentSec : 0,
      startingFen: typeof req.body?.startingFen === "string" ? req.body.startingFen : undefined,
      openingName: typeof req.body?.openingName === "string" ? req.body.openingName : undefined,
      orientation:
        req.body?.orientation === "white" || req.body?.orientation === "black"
          ? req.body.orientation
          : undefined,
      mistakes: parseMistakeSnapshotPayload(req.body?.mistakes),
    });
    res.status(200).json(result.variantInfo);
  } catch (err) {
    next(err);
  }
}

export async function postVariantReview(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const variantName = typeof req.body?.variantName === "string" ? req.body.variantName.trim() : "";
    if (!variantName) {
      return res.status(400).json({ message: "variantName is required" });
    }

    const parsedRating = parseReviewRating(req.body?.rating);
    if (!parsedRating) {
      return res.status(400).json({ message: "rating must be one of: again, hard, good, easy" });
    }

    const parsedSuggestedRating = parseReviewRating(req.body?.suggestedRating);
    const result = await saveVariantReview({
      userId: getRequestUserId(req),
      repertoireId: id,
      variantName,
      rating: parsedRating,
      suggestedRating: parsedSuggestedRating || undefined,
      acceptedSuggested:
        typeof req.body?.acceptedSuggested === "boolean" ? req.body.acceptedSuggested : undefined,
      wrongMoves: Number.isFinite(req.body?.wrongMoves) ? req.body.wrongMoves : undefined,
      ignoredWrongMoves: Number.isFinite(req.body?.ignoredWrongMoves) ? req.body.ignoredWrongMoves : undefined,
      hintsUsed: Number.isFinite(req.body?.hintsUsed) ? req.body.hintsUsed : undefined,
      timeSpentSec: Number.isFinite(req.body?.timeSpentSec) ? req.body.timeSpentSec : undefined,
      startingFen: typeof req.body?.startingFen === "string" ? req.body.startingFen : undefined,
      openingName: typeof req.body?.openingName === "string" ? req.body.openingName : undefined,
      orientation:
        req.body?.orientation === "white" || req.body?.orientation === "black"
          ? req.body.orientation
          : undefined,
      mistakes: parseMistakeSnapshotPayload(req.body?.mistakes),
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getVariantMistakes(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const openingName =
      typeof req.query?.openingName === "string" ? req.query.openingName : undefined;
    const dueOnly =
      typeof req.query?.dueOnly === "string" ? req.query.dueOnly === "true" : false;
    const mistakes = await getVariantMistakesForRepertoire({
      userId: getRequestUserId(req),
      repertoireId: id,
      openingName,
      dueOnly,
    });
    res.status(200).json(mistakes);
  } catch (err) {
    next(err);
  }
}

export async function postVariantMistakeReview(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const mistakeKey =
      typeof req.body?.mistakeKey === "string" ? req.body.mistakeKey.trim() : "";
    if (!mistakeKey) {
      return res.status(400).json({ message: "mistakeKey is required" });
    }
    const rating = parseReviewRating(req.body?.rating);
    if (!rating) {
      return res
        .status(400)
        .json({ message: "rating must be one of: again, hard, good, easy" });
    }
    const updatedMistake = await reviewVariantMistake({
      userId: getRequestUserId(req),
      repertoireId: id,
      mistakeKey,
      rating,
    });
    res.status(200).json(updatedMistake);
  } catch (err) {
    next(err);
  }
}

export async function deleteVariantInfo(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const db = getDB();
    await db.collection("variantsInfo").deleteOne({ _id: new ObjectId(id), ...getUserFilter(req) });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function updateRepertoire(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { name, orientation, moveNodes } = req.body;
    const db = getDB();
    const repertoire = await db.collection("repertoires").findOneAndUpdate(
      { _id: new ObjectId(id), ...getUserFilter(req) },
      { $set: { name, moveNodes, orientation } }
    );
    res.json(repertoire);
  } catch (err) {
    next(err);
  }
}

export async function updateRepertoireName(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const db = getDB();
    const repertoire = await db.collection("repertoires").findOneAndUpdate({ _id: new ObjectId(id), ...getUserFilter(req) }, { $set: { name } });
    res.json(repertoire);
  } catch (err) {
    next(err);
  }
}

export async function moveRepertoireOrderUp(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const db = getDB();
    const currentRepertoire = await db.collection("repertoires").findOne({ _id: new ObjectId(id), ...getUserFilter(req) });
    if (!currentRepertoire) {
      return res.status(404).json({ message: "Repertoire not found" });
    }
    if (currentRepertoire.order === 0) {
      return res.status(200).json(currentRepertoire);
    }
    const upperRepertoire = await db.collection("repertoires").findOne({ order: currentRepertoire.order - 1, ...getUserFilter(req) });
    if (!upperRepertoire) {
      return res.status(500).json({ message: "Upper repertoire not found" });
    }
    const currentRepertoireUpdateResult = await db.collection("repertoires").findOneAndUpdate(
      { _id: new ObjectId(id), ...getUserFilter(req) },
      { $set: { order: upperRepertoire.order } }
    );
    await db.collection("repertoires").findOneAndUpdate(
      { _id: new ObjectId(upperRepertoire._id), ...getUserFilter(req) },
      { $set: { order: currentRepertoire.order } }
    );
    res.json(currentRepertoireUpdateResult);
  } catch (err) {
    next(err);
  }
}

export async function deleteRepertoire(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const db = getDB();
    const repertoireToDelete = await db.collection("repertoires").findOne({ _id: new ObjectId(id), ...getUserFilter(req) });
    if (!repertoireToDelete) {
      return res.json({ message: "Repertoire not found or already deleted" });
    }
    const deleteResult = await db.collection("repertoires").deleteOne({ _id: new ObjectId(id), ...getUserFilter(req) });
    if (deleteResult.deletedCount > 0) {
      await db.collection("repertoires").updateMany({ order: { $gt: repertoireToDelete.order }, ...getUserFilter(req) }, { $inc: { order: -1 } });
      return res.json(deleteResult);
    }
    return res.json({ message: "Repertoire not found or already deleted" });
  } catch (err) {
    next(err);
  }
}

export async function disableRepertoire(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const db = getDB();
    const repertoire = await db.collection("repertoires").findOneAndUpdate(
      { _id: new ObjectId(id), ...getUserFilter(req) },
      { $set: { disabled: true } }
    );
    res.json(repertoire);
  } catch (err) {
    next(err);
  }
}

export async function enableRepertoire(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const db = getDB();
    const repertoire = await db.collection("repertoires").findOneAndUpdate(
      { _id: new ObjectId(id), ...getUserFilter(req) },
      { $set: { disabled: false } }
    );
    res.json(repertoire);
  } catch (err) {
    next(err);
  }
}
