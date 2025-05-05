import { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../db/mongo";

export async function getRepertoires(req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDB();
    const repertoires = await db
      .collection("repertoires")
      .find({})
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
        { $sort: { order: 1 } },
        {
          $lookup: {
            from: "variantsInfo",
            let: { repertoireId: { $toString: "$_id" } },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$repertoireId", "$$repertoireId"] },
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
    const repertoires = await db
      .collection("repertoires")
      .find({})
      .sort({ order: 1 })
      .toArray();
    res.setHeader("Content-disposition", "attachment; filename=repertoires.json");
    res.setHeader("Content-type", "application/json");
    res.write(JSON.stringify(repertoires));
    res.end();
  } catch (err) {
    next(err);
  }
}

export async function getRepertoireById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const db = getDB();
    const repertoire = await db
      .collection("repertoires")
      .findOne({ _id: new ObjectId(id) });
    res.json(repertoire);
  } catch (err) {
    next(err);
  }
}

export async function downloadRepertoireById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const db = getDB();
    const repertoire = await db
      .collection("repertoires")
      .findOne({ _id: new ObjectId(id) });
    if (!repertoire) {
      return res.status(404).json({ message: "Repertoire not found" });
    }
    res.setHeader(
      "Content-disposition",
      `attachment; filename=${repertoire.name}.json`
    );
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
    const highestOrderRepertoire = await db
      .collection("repertoires")
      .findOne({}, { sort: { order: -1 } });
    const order = highestOrderRepertoire ? highestOrderRepertoire.order + 1 : 1;
    const repertoire = await db
      .collection("repertoires")
      .insertOne({ name, moveNodes, orientation, order });
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
    const highestOrderRepertoire = await db
      .collection("repertoires")
      .findOne({}, { sort: { order: -1 } });
    const order = highestOrderRepertoire ? highestOrderRepertoire.order + 1 : 1;
    const repertoire = await db
      .collection("repertoires")
      .findOne({ _id: new ObjectId(id) });
    const repertoireWithoutId = { ...repertoire, _id: undefined };
    const newRepertoire = await db
      .collection("repertoires")
      .insertOne({ ...repertoireWithoutId, name, order });
    res.json(newRepertoire);
  } catch (err) {
    next(err);
  }
}

export async function getVariantsInfo(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const db = getDB();
    const variantsInfo = await db
      .collection("variantsInfo")
      .find({ repertoireId: id })
      .toArray();
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
    const trainVariantsInfo = await db
      .collection("variantsInfo")
      .findOne({ repertoireId: id, variantName });
    if (!trainVariantsInfo) {
      const newVariantInfo = {
        repertoireId: id,
        variantName,
        errors,
        lastDate: new Date(),
      };
      await db.collection("variantsInfo").insertOne(newVariantInfo);
      return res.status(201).json(newVariantInfo);
    }
    const currentDate = new Date();
    const lastDate = new Date(trainVariantsInfo.lastDate);
    const shouldUpdate =
      errors > trainVariantsInfo.errors ||
      (errors <= trainVariantsInfo.errors && currentDate > lastDate);
    if (!shouldUpdate) {
      return res.status(200).json({ message: "No update needed" });
    }
    const updatedVariants = await db
      .collection("variantsInfo")
      .findOneAndUpdate(
        { _id: new ObjectId(trainVariantsInfo._id) },
        {
          $set: { repertoireId: id, variantName, errors, lastDate: currentDate },
        },
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
    await db.collection("variantsInfo").deleteOne({ _id: new ObjectId(id) });
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
    const repertoire = await db
      .collection("repertoires")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
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
    const repertoire = await db
      .collection("repertoires")
      .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: { name } });
    res.json(repertoire);
  } catch (err) {
    next(err);
  }
}

export async function moveRepertoireOrderUp(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const db = getDB();
    const currentRepertoire = await db
      .collection("repertoires")
      .findOne({ _id: new ObjectId(id) });
    if (!currentRepertoire) {
      return res.status(404).json({ message: "Repertoire not found" });
    }
    if (currentRepertoire.order === 0) {
      return res.status(200).json(currentRepertoire);
    }
    const upperRepertoire = await db
      .collection("repertoires")
      .findOne({ order: currentRepertoire.order - 1 });
    if (!upperRepertoire) {
      return res.status(500).json({ message: "Upper repertoire not found" });
    }
    const currentRepertoireUpdateResult = await db
      .collection("repertoires")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { order: upperRepertoire.order } }
      );
    await db
      .collection("repertoires")
      .findOneAndUpdate(
        { _id: new ObjectId(upperRepertoire._id) },
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
    await db.collection("repertoires").deleteOne({ _id: new ObjectId(id) });
    const repertoireToDelete = await db
      .collection("repertoires")
      .findOne({ _id: new ObjectId(id) });
    if (repertoireToDelete) {
      const deleteResult = await db
        .collection("repertoires")
        .deleteOne({ _id: new ObjectId(id) });
      if (deleteResult.deletedCount > 0) {
        await db
          .collection("repertoires")
          .updateMany(
            { order: { $gt: repertoireToDelete.order } },
            { $inc: { order: -1 } }
          );
        res.json(deleteResult);
      }
    } else {
      res.json({ message: "Repertoire not found or already deleted" });
    }
  } catch (err) {
    next(err);
  }
}

export async function disableRepertoire(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const db = getDB();
    const repertoire = await db
      .collection("repertoires")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
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
    const repertoire = await db
      .collection("repertoires")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { disabled: false } }
      );
    res.json(repertoire);
  } catch (err) {
    next(err);
  }
}