import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";

const uri =
  process.env.MONGODB_URI || "mongodb://localhost:27017/chess_opening_master";
const client = new MongoClient(uri);

const app = express();
const port = process.env.BACKEND_PORT || 3001;

app.use(
  express.json({
    limit: "100mb",
    type: ["application/json", "text/plain"],
  })
);
app.use(cors());
app.get("/repertoires", async (req, res) => {
  await client.connect();
  const db = client.db("chess-opening-master");
  const repertoires = await db
    .collection("repertoires")
    .find({})
    .sort({ order: 1 })
    .project({ name: 1, _id: 1 })
    .toArray();
  res.json(repertoires);
});

app.get("/repertoires/full", async (req, res) => {
  await client.connect();
  const db = client.db("chess-opening-master");
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
});

app.get("/repertoires/download", async (req, res) => {
  await client.connect();
  const db = client.db("chess-opening-master");
  const repertoires = await db
    .collection("repertoires")
    .find({})
    .sort({ order: 1 })
    .toArray();
  res.setHeader("Content-disposition", "attachment; filename=repertoires.json");
  res.setHeader("Content-type", "application/json");
  res.write(JSON.stringify(repertoires));
  res.end();
});

app.get("/repertoires/:id", async (req, res) => {
  await client.connect();
  const { id } = req.params;
  const db = client.db("chess-opening-master");
  const repertoire = await db
    .collection("repertoires")
    .findOne({ _id: new ObjectId(id) });
  res.json(repertoire);
});

app.get("/repertoires/:id/download", async (req, res) => {
  await client.connect();
  const { id } = req.params;
  const db = client.db("chess-opening-master");
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
});

app.post("/repertoires", async (req, res) => {
  await client.connect();
  const { name, orientation, moveNodes } = req.body;
  const db = client.db("chess-opening-master");

  const highestOrderRepertoire = await db
    .collection("repertoires")
    .findOne({}, { sort: { order: -1 } });
  const order = highestOrderRepertoire ? highestOrderRepertoire.order + 1 : 1;

  const repertoire = await db
    .collection("repertoires")
    .insertOne({ name, moveNodes, orientation, order });
  res.json(repertoire);
});

app.post("/repertoires/:id/duplicate", async (req, res) => {
  await client.connect();
  const { id } = req.params;
  const { name } = req.body;
  const db = client.db("chess-opening-master");

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
});

app.get("/repertoires/:id/variantsInfo", async (req, res) => {
  await client.connect();
  const { id } = req.params;
  const db = client.db("chess-opening-master");
  const variantsInfo = await db
    .collection("variantsInfo")
    .find({ repertoireId: id })
    .toArray();
  res.json(variantsInfo);
});

app.post("/repertoires/:id/variantsInfo", async (req, res) => {
  await client.connect();
  const { id } = req.params;
  const { variantName, errors } = req.body;
  const db = client.db("chess-opening-master");
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
    (errors < trainVariantsInfo.errors && currentDate > lastDate);

  if (!shouldUpdate) {
    return res.status(200).json({ message: "No update needed" });
  }

  const updatedVariants = await db
    .collection("variantsInfo")
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: { repertoireId: id, variantName, errors, lastDate: currentDate },
      },
      { returnDocument: "after" }
    );

  res.json(updatedVariants);
});

app.put("/repertoires/:id", async (req, res) => {
  await client.connect();
  const { id } = req.params;
  const { name, orientation, moveNodes } = req.body;
  const db = client.db("chess-opening-master");
  const repertoire = await db
    .collection("repertoires")
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { name, moveNodes, orientation } }
    );
  res.json(repertoire);
});

app.put("/repertoires/:id/name", async (req, res) => {
  await client.connect();
  const { id } = req.params;
  const { name } = req.body;
  const db = client.db("chess-opening-master");
  const repertoire = await db
    .collection("repertoires")
    .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: { name } });
  res.json(repertoire);
});

app.patch("/repertoires/:id/order/up", async (req, res) => {
  await client.connect();
  const { id } = req.params;
  const db = client.db("chess-opening-master");

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
});

app.delete("/repertoires/:id", async (req, res) => {
  await client.connect();
  const { id } = req.params;
  const db = client.db("chess-opening-master");
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
});

app.listen(port, () => {
  console.log(process.env.MONGODB_URI);
  console.log(`Example app listening at http://localhost:${port}`);
});
