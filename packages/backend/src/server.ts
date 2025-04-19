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

// Add studies collection routes
app.get("/studies", async (req, res) => {
  await client.connect();
  const db = client.db("chess-opening-master");
  const groups = await db.collection("studies").find({}).toArray();
  res.json(groups);
});

app.post("/studies", async (req, res) => {
  await client.connect();
  const { name } = req.body;
  const db = client.db("chess-opening-master");
  const result = await db.collection("studies").insertOne({ name, studies: [] });
  const group = await db.collection("studies").findOne({ _id: result.insertedId });
  res.json(group);
});

app.put("/studies/:id/name", async (req, res) => {
  await client.connect();
  const { id } = req.params;
  const { name } = req.body;
  const db = client.db("chess-opening-master");
  await db
    .collection("studies")
    .updateOne({ _id: new ObjectId(id) }, { $set: { name } });
  res.sendStatus(200);
});

app.delete("/studies/:id", async (req, res) => {
  await client.connect();
  const { id } = req.params;
  const db = client.db("chess-opening-master");
  await db.collection("studies").deleteOne({ _id: new ObjectId(id) });
  res.sendStatus(200);
});

app.post("/studies/:groupId/studies", async (req, res) => {
  await client.connect();
  const { groupId } = req.params;
  const { name, tags } = req.body;
  const db = client.db("chess-opening-master");
  const studyId = new ObjectId().toString();
  const newStudy = { id: studyId, name, tags, entries: [], sessions: [] };
  await db
    .collection("studies")
    .updateOne(
      { _id: new ObjectId(groupId) },
      { $push: { studies: newStudy } }
    );
  res.json(newStudy);
});

// Get a single study by id (including entries and sessions)
app.get("/studies/:groupId/studies/:studyId", async (req, res) => {
  const { groupId, studyId } = req.params;
  await client.connect();
  const db = client.db("chess-opening-master");
  const group = await db.collection("studies").findOne({ _id: new ObjectId(groupId) });
  if (!group) return res.status(404).json({ message: "Study group not found" });
  const study = (group.studies || []).find((s: any) => s.id === studyId);
  if (!study) return res.status(404).json({ message: "Study not found" });
  res.json(study);
});

// Study Entry CRUD
app.post("/studies/:groupId/studies/:studyId/entries", async (req, res) => {
  const { groupId, studyId } = req.params;
  const { title, externalUrl, description } = req.body;
  const db = client.db("chess-opening-master");
  const entryId = new ObjectId().toString();
  const newEntry = { id: entryId, title, externalUrl, description };
  await client.connect();
  await db.collection("studies").updateOne(
    { _id: new ObjectId(groupId), "studies.id": studyId },
    { $push: { "studies.$.entries": newEntry } }
  );
  res.json(newEntry);
});

app.put("/studies/:groupId/studies/:studyId/entries/:entryId", async (req, res) => {
  const { groupId, studyId, entryId } = req.params;
  const { title, externalUrl, description } = req.body;
  await client.connect();
  const db = client.db("chess-opening-master");
  await db.collection("studies").updateOne(
    { _id: new ObjectId(groupId) },
    {
      $set: {
        "studies.$[study].entries.$[entry].title": title,
        "studies.$[study].entries.$[entry].externalUrl": externalUrl,
        "studies.$[study].entries.$[entry].description": description,
      }
    },
    {
      arrayFilters: [
        { "study.id": studyId },
        { "entry.id": entryId }
      ]
    }
  );
  res.sendStatus(200);
});

app.delete("/studies/:groupId/studies/:studyId/entries/:entryId", async (req, res) => {
  const { groupId, studyId, entryId } = req.params;
  await client.connect();
  const db = client.db("chess-opening-master");
  await db.collection("studies").updateOne(
    { _id: new ObjectId(groupId) },
    { $pull: { "studies.$[study].entries": { id: entryId } } },
    { arrayFilters: [{ "study.id": studyId }] }
  );
  res.sendStatus(200);
});

// Study Session CRUD
app.post("/studies/:groupId/studies/:studyId/sessions", async (req, res) => {
  const { groupId, studyId } = req.params;
  const { start, duration, manual, comment } = req.body;
  await client.connect();
  const db = client.db("chess-opening-master");
  const sessionId = new ObjectId().toString();
  const newSession = { id: sessionId, start, duration, manual: manual || false, comment: comment || undefined };
  await db.collection("studies").updateOne(
    { _id: new ObjectId(groupId), "studies.id": studyId },
    { $push: { "studies.$.sessions": newSession } }
  );
  res.json(newSession);
});

app.delete("/studies/:groupId/studies/:studyId/sessions/:sessionId", async (req, res) => {
  const { groupId, studyId, sessionId } = req.params;
  await client.connect();
  const db = client.db("chess-opening-master");
  await db.collection("studies").updateOne(
    { _id: new ObjectId(groupId), "studies.id": studyId },
    { $pull: { "studies.$.sessions": { id: sessionId } } }
  );
  res.sendStatus(200);
});
