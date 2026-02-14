import { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../db/mongo";
import { getRequestUserId } from "../utils/requestUser";
import AdmZip from "adm-zip";

const getUserFilter = (req: Request) => ({ userId: getRequestUserId(req) });

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
    const repertoires = await db
      .collection("repertoires")
      .aggregate([
        { $match: getUserFilter(req) },
        { $sort: { order: 1 } },
        {
          $lookup: {
            from: "variantsInfo",
            let: { repertoireId: { $toString: "$_id" }, userId: "$userId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$repertoireId", "$$repertoireId"] },
                      { $eq: ["$userId", "$$userId"] },
                    ],
                  },
                },
              },
            ],
            as: "variantsInfo",
          },
        },
      ])
      .toArray();
    res.json(repertoires);
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
    const { variantName, errors } = req.body;
    const db = getDB();
    const trainVariantsInfo = await db.collection("variantsInfo").findOne({ repertoireId: id, variantName, ...getUserFilter(req) });
    if (!trainVariantsInfo) {
      const newVariantInfo = { repertoireId: id, variantName, errors, lastDate: new Date(), ...getUserFilter(req) };
      await db.collection("variantsInfo").insertOne(newVariantInfo);
      return res.status(201).json(newVariantInfo);
    }
    const currentDate = new Date();
    const lastDate = new Date(trainVariantsInfo.lastDate);
    const shouldUpdate = errors > trainVariantsInfo.errors || (errors <= trainVariantsInfo.errors && currentDate > lastDate);
    if (!shouldUpdate) {
      return res.status(200).json({ message: "No update needed" });
    }
    const updatedVariants = await db.collection("variantsInfo").findOneAndUpdate(
      { _id: new ObjectId(trainVariantsInfo._id) },
      { $set: { repertoireId: id, variantName, errors, lastDate: currentDate } },
      { returnDocument: "after" }
    );
    res.json(updatedVariants);
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
