import { getDB } from "../db/mongo";
import { PositionError } from "../models/PositionError";
import { ObjectId, WithId, Document } from "mongodb";
import { BoardOrientation } from "@chess-opening-master/common";

const COLLECTION_NAME = "positionErrors";

const mapDocumentToPositionError = (doc: WithId<Document>): PositionError => ({
  _id: doc._id.toString(),
  fen: doc.fen,
  repertoireId: doc.repertoireId,
  variantName: doc.variantName,
  orientation: doc.orientation ?? "white",
  wrongMove: doc.wrongMove,
  expectedMoves: doc.expectedMoves,
  errorCount: doc.errorCount,
  lastErrorDate: doc.lastErrorDate,
  createdAt: doc.createdAt,
});

export const recordPositionError = async (
  fen: string,
  repertoireId: string,
  wrongMove: string,
  expectedMoves: string[],
  variantName?: string,
  orientation?: BoardOrientation
): Promise<PositionError> => {
  const db = getDB();
  const collection = db.collection(COLLECTION_NAME);

  await collection.updateOne(
    { fen, repertoireId, wrongMove },
    {
      $inc: { errorCount: 1 },
      $set: {
        expectedMoves,
        lastErrorDate: new Date(),
        ...(variantName && { variantName }),
        ...(orientation && { orientation }),
      },
      $setOnInsert: {
        fen,
        repertoireId,
        wrongMove,
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );

  const result = await collection.findOne({ fen, repertoireId, wrongMove });
  return mapDocumentToPositionError(result!);
};

export const getPositionErrors = async (): Promise<PositionError[]> => {
  const db = getDB();
  const errors = await db
    .collection(COLLECTION_NAME)
    .find({})
    .sort({ errorCount: -1 })
    .toArray();

  return errors.map(mapDocumentToPositionError);
};

export const getPositionErrorsByRepertoire = async (
  repertoireId: string
): Promise<PositionError[]> => {
  const db = getDB();
  const errors = await db
    .collection(COLLECTION_NAME)
    .find({ repertoireId })
    .sort({ errorCount: -1 })
    .toArray();

  return errors.map(mapDocumentToPositionError);
};

export const getTopPositionErrors = async (
  limit: number = 10,
  repertoireId?: string
): Promise<PositionError[]> => {
  const db = getDB();
  const query = repertoireId ? { repertoireId } : {};

  const errors = await db
    .collection(COLLECTION_NAME)
    .find(query)
    .sort({ errorCount: -1, lastErrorDate: -1 })
    .limit(limit)
    .toArray();

  return errors.map(mapDocumentToPositionError);
};

export const deletePositionError = async (id: string): Promise<boolean> => {
  const db = getDB();
  const result = await db
    .collection(COLLECTION_NAME)
    .deleteOne({ _id: new ObjectId(id) });

  return result.deletedCount === 1;
};

export const deletePositionErrorsByRepertoire = async (
  repertoireId: string
): Promise<number> => {
  const db = getDB();
  const result = await db
    .collection(COLLECTION_NAME)
    .deleteMany({ repertoireId });

  return result.deletedCount;
};

export const resolvePositionError = async (
  id: string
): Promise<PositionError | null> => {
  const db = getDB();
  const collection = db.collection(COLLECTION_NAME);
  
  await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { errorCount: 0, lastErrorDate: new Date() } }
  );

  const result = await collection.findOne({ _id: new ObjectId(id) });
  return result ? mapDocumentToPositionError(result) : null;
};
