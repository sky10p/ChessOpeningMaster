import { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../db/mongo";

export async function getStudies(req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDB();
    const groups = await db.collection("studies").find({}).toArray();
    res.json(groups);
  } catch (err) {
    next(err);
  }
}

export async function createStudyGroup(req: Request, res: Response, next: NextFunction) {
  try {
    const { name } = req.body;
    const db = getDB();
    const result = await db.collection("studies").insertOne({ name, studies: [] });
    const group = await db.collection("studies").findOne({ _id: result.insertedId });
    res.json(group);
  } catch (err) {
    next(err);
  }
}

export async function updateStudyGroupName(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const db = getDB();
    await db.collection("studies").updateOne({ _id: new ObjectId(id) }, { $set: { name } });
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
}

export async function deleteStudyGroup(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const db = getDB();
    await db.collection("studies").deleteOne({ _id: new ObjectId(id) });
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
}

export async function createStudy(req: Request, res: Response, next: NextFunction) {
  try {
    const { groupId } = req.params;
    const { name, tags } = req.body;
    const db = getDB();
    const studyId = new ObjectId().toString();
    const newStudy = { id: studyId, name, tags, entries: [], sessions: [] };
    await db.collection("studies").updateOne(
      { _id: new ObjectId(groupId) },
      { $push: { studies: newStudy } }
    );
    res.json(newStudy);
  } catch (err) {
    next(err);
  }
}

export async function getStudy(req: Request, res: Response, next: NextFunction) {
  try {
    const { groupId, studyId } = req.params;
    const db = getDB();
    const group = await db.collection("studies").findOne({ _id: new ObjectId(groupId) });
    if (!group) return res.status(404).json({ message: "Study group not found" });
    const study = (group.studies || []).find((s: { id: string }) => s.id === studyId);
    if (!study) return res.status(404).json({ message: "Study not found" });
    res.json(study);
  } catch (err) {
    next(err);
  }
}

export async function deleteStudy(req: Request, res: Response, next: NextFunction) {
  try {
    const { groupId, studyId } = req.params;
    const db = getDB();
    const result = await db.collection("studies").updateOne(
      { _id: new ObjectId(groupId) },
      { $pull: { studies: { id: studyId } } }
    );
    if (result.modifiedCount > 0) {
      res.sendStatus(200);
    } else {
      res.status(404).json({ message: "Study not found" });
    }
  } catch (err) {
    next(err);
  }
}

export async function createStudyEntry(req: Request, res: Response, next: NextFunction) {
  try {
    const { groupId, studyId } = req.params;
    const { title, externalUrl, description } = req.body;
    const db = getDB();
    const entryId = new ObjectId().toString();
    const newEntry = { id: entryId, title, externalUrl, description };
    await db.collection("studies").updateOne(
      { _id: new ObjectId(groupId), "studies.id": studyId },
      { $push: { "studies.$.entries": newEntry } }
    );
    res.json(newEntry);
  } catch (err) {
    next(err);
  }
}

export async function updateStudyEntry(req: Request, res: Response, next: NextFunction) {
  try {
    const { groupId, studyId, entryId } = req.params;
    const { title, externalUrl, description } = req.body;
    const db = getDB();
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
  } catch (err) {
    next(err);
  }
}

export async function deleteStudyEntry(req: Request, res: Response, next: NextFunction) {
  try {
    const { groupId, studyId, entryId } = req.params;
    const db = getDB();
    await db.collection("studies").updateOne(
      { _id: new ObjectId(groupId) },
      { $pull: { "studies.$[study].entries": { id: entryId } } },
      { arrayFilters: [{ "study.id": studyId }] }
    );
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
}

export async function createStudySession(req: Request, res: Response, next: NextFunction) {
  try {
    const { groupId, studyId } = req.params;
    const { start, duration, manual, comment } = req.body;
    const db = getDB();
    const sessionId = new ObjectId().toString();
    const newSession = { id: sessionId, start, duration, manual: manual || false, comment: comment || undefined };
    await db.collection("studies").updateOne(
      { _id: new ObjectId(groupId), "studies.id": studyId },
      { $push: { "studies.$.sessions": newSession } }
    );
    res.json(newSession);
  } catch (err) {
    next(err);
  }
}

export async function deleteStudySession(req: Request, res: Response, next: NextFunction) {
  try {
    const { groupId, studyId, sessionId } = req.params;
    const db = getDB();
    await db.collection("studies").updateOne(
      { _id: new ObjectId(groupId), "studies.id": studyId },
      { $pull: { "studies.$.sessions": { id: sessionId } } }
    );
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
}
