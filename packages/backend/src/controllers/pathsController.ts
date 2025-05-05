import { Request, Response, NextFunction } from "express";
import { getDB } from "../db/mongo";
import { VariantInfo } from "../models/VariantInfo";
import { StudySession } from "../models/Study";
import { Path } from "../models/Path";
import { Db, ObjectId } from "mongodb";

const getRepertoireName = async (db: Db, repertoireId: string): Promise<string> => {
  const repertoire = await db.collection("repertoires").findOne({ _id: new ObjectId(repertoireId) });
  return repertoire ? repertoire.name : "Unknown Repertoire";
}

export async function getPaths(req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDB();
    interface VariantInfoDocument {
      _id: string;
      repertoireId: string;
      variantName: string;
      errors: number;
      lastDate: string | { $date: string };
    }

    const allVariantsInfo: VariantInfo[] = (await db.collection<VariantInfoDocument>("variantsInfo").find({}).toArray()).map((v) => ({
      _id: { $oid: v._id },
      repertoireId: v.repertoireId,
      variantName: v.variantName,
      errors: v.errors,
      lastDate: typeof v.lastDate === 'object' && '$date' in v.lastDate ? v.lastDate : { $date: v.lastDate }
    }));

    const repertoireIds = [...new Set(allVariantsInfo.map(variant => variant.repertoireId))];
    
    const repertoireStatusMap = new Map<string, boolean>();
    const repertoires = await db.collection("repertoires").find(
      { _id: { $in: repertoireIds.map(id => new ObjectId(id)) } },
      { projection: { _id: 1, disabled: 1 } }
    ).toArray();
    
    for (const repertoire of repertoires) {
      repertoireStatusMap.set(String(repertoire._id), repertoire.disabled || false);
    }
    
    const variantsInfo = allVariantsInfo.filter(variant => 
      !repertoireStatusMap.get(variant.repertoireId)
    );

    const studiesGroups = await db.collection("studies").find({}).toArray();

    let variantToReview: VariantInfo | null = null;
    if (variantsInfo.length > 0) {
      variantToReview = variantsInfo.reduce((prev: VariantInfo, curr: VariantInfo) => {
        const prevDate = typeof prev.lastDate === 'object' && '$date' in prev.lastDate ? prev.lastDate.$date : prev.lastDate;
        const currDate = typeof curr.lastDate === 'object' && '$date' in curr.lastDate ? curr.lastDate.$date : curr.lastDate;
        if (curr.errors > prev.errors) return curr;
        if (curr.errors === prev.errors) {
          return new Date(currDate) < new Date(prevDate) ? curr : prev;
        }
        return prev;
      }, variantsInfo[0] as VariantInfo);
    }

    type StudyToReview = { groupId: string; studyId: string; name: string; lastSession?: string };
    let studyToReview: StudyToReview | null = null;
    let oldestSessionDate: string | null = null;
    for (const group of studiesGroups) {
      for (const study of group.studies || []) {
        if (!study.sessions || study.sessions.length === 0) {
          studyToReview = { groupId: String(group._id), studyId: study.id, name: study.name };
          break;
        } else {
          const lastSession = study.sessions.reduce((prev: StudySession, curr: StudySession) => new Date(curr.start) > new Date(prev.start) ? curr : prev, study.sessions[0]);
          if (!oldestSessionDate || new Date(lastSession.start) < new Date(oldestSessionDate)) {
            oldestSessionDate = lastSession.start;
            studyToReview = { groupId: String(group._id), studyId: study.id, name: study.name, lastSession: lastSession.start };
          }
        }
      }
      if (studyToReview && !studyToReview.lastSession) break;
    }

    let result: Path;
    if (variantToReview && (!studyToReview || variantToReview.errors > 0)) {
      
      const variantId = typeof variantToReview._id === 'object' && '$oid' in variantToReview._id 
        ? variantToReview._id.$oid 
        : String(variantToReview._id);
        
      result = {
        type: "variant",
        id: variantId,
        repertoireId: variantToReview.repertoireId,
        repertoireName: await getRepertoireName(db, variantToReview.repertoireId),
        name: variantToReview.variantName,
        errors: variantToReview.errors,
        lastDate: variantToReview.lastDate
      };
    } else if (studyToReview) {
      result = {
        type: "study",
        groupId: studyToReview.groupId,
        studyId: studyToReview.studyId,
        name: studyToReview.name,
        lastSession: studyToReview.lastSession || null
      };
    } else {
      result = { message: "No variants or studies to review." };
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
}
