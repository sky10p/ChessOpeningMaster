import { ObjectId } from "mongodb";
import { getDB } from "../db/mongo";


export const getRepertoireName = async (repertoireId: string): Promise<string> => {
  const db = getDB();
  const repertoire = await db.collection("repertoires").findOne({ 
    _id: new ObjectId(repertoireId) 
  });
  return repertoire ? repertoire.name : "Unknown Repertoire";
};


export const getRepertoireStatusMap = async (repertoireIds: string[]): Promise<Map<string, boolean>> => {
  const db = getDB();
  const repertoireStatusMap = new Map<string, boolean>();
  
  const repertoires = await db.collection("repertoires").find(
    { _id: { $in: repertoireIds.map(id => new ObjectId(id)) } },
    { projection: { _id: 1, disabled: 1 } }
  ).toArray();
  
  for (const repertoire of repertoires) {
    repertoireStatusMap.set(String(repertoire._id), repertoire.disabled || false);
  }
  
  return repertoireStatusMap;
};