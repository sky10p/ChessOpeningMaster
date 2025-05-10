import { getDB } from "../db/mongo";
import { VariantInfo } from "../models/VariantInfo";
import { StudySession } from "../models/Study";
import { normalizeDate } from "../utils/dateUtils";
import { Path } from "../models/Path";
import { getRepertoireName } from "./repertoireService";
import { extractId } from "../utils/idUtils";
import { Document, ObjectId } from "mongodb";

export interface VariantInfoDocument {
  _id: string;
  repertoireId: string;
  variantName: string;
  errors: number;
  lastDate: string | { $date: string };
}

export interface StudyToReview {
  groupId: string;
  studyId: string;
  name: string;
  lastSession?: string;
}

export interface StudyGroup {
  _id: string | ObjectId;
  name: string;
  studies: Array<{
    id: string;
    name: string;
    sessions?: StudySession[];
  }>;
}

interface StudyDocument {
  _id?: string | ObjectId;
  id?: string;
  name?: string;
  sessions?: StudySession[];
}

interface StudyGroupDocument extends Document {
  _id: ObjectId;
  name?: string;
  studies?: StudyDocument[];
}

export const getActiveVariants = async (): Promise<VariantInfo[]> => {
  const db = getDB();
  
  const allVariantsInfo: VariantInfo[] = (await db.collection<VariantInfoDocument>("variantsInfo")
    .find({})
    .toArray())
    .map((v) => ({
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
  
  return allVariantsInfo.filter(variant => !repertoireStatusMap.get(variant.repertoireId));
};

export const findVariantToReview = (variants: VariantInfo[]): VariantInfo | null => {
  if (variants.length === 0) return null;
  
  return variants.reduce((prev: VariantInfo, curr: VariantInfo) => {
    const prevDate = normalizeDate(prev.lastDate);
    const currDate = normalizeDate(curr.lastDate);
    
    if (curr.errors > prev.errors) return curr;
    if (curr.errors === prev.errors) {
      return new Date(currDate) < new Date(prevDate) ? curr : prev;
    }
    return prev;
  }, variants[0]);
};

export const getStudyGroups = async (): Promise<StudyGroup[]> => {
  const db = getDB();
  const studyDocs = await db.collection<StudyGroupDocument>("studies").find({}).toArray();
  return studyDocs.map(doc => ({
    _id: doc._id,
    name: doc.name || "Unnamed Study Group",
    studies: Array.isArray(doc.studies) ? doc.studies.map((study: StudyDocument) => ({
      id: study.id || String(study._id || ""),
      name: study.name || "Unnamed Study",
      sessions: study.sessions || []
    })) : []
  }));
};

export const findStudyToReview = (studyGroups: StudyGroup[]): StudyToReview | null => {
  let studyToReview: StudyToReview | null = null;
  let oldestSessionDate: string | null = null;
  
  for (const group of studyGroups) {
    for (const study of group.studies || []) {
      if (!study.sessions || study.sessions.length === 0) {
        studyToReview = { 
          groupId: String(group._id), 
          studyId: study.id, 
          name: study.name 
        };
        return studyToReview;
      } else {
        const lastSession = study.sessions.reduce(
          (prev: StudySession, curr: StudySession) => 
            new Date(curr.start) > new Date(prev.start) ? curr : prev, 
          study.sessions[0]
        );
        
        if (!oldestSessionDate || new Date(lastSession.start) < new Date(oldestSessionDate)) {
          oldestSessionDate = lastSession.start;
          studyToReview = { 
            groupId: String(group._id), 
            studyId: study.id, 
            name: study.name, 
            lastSession: lastSession.start 
          };
        }
      }
    }
  }
  
  return studyToReview;
};

export const createVariantPath = async (variant: VariantInfo): Promise<Path> => {
  const variantId = extractId(variant._id);
  
  return {
    type: "variant",
    id: variantId,
    repertoireId: variant.repertoireId,
    repertoireName: await getRepertoireName(variant.repertoireId),
    name: variant.variantName,
    errors: variant.errors,
    lastDate: variant.lastDate
  };
};

export const createStudyPath = (study: StudyToReview): Path => {
  return {
    type: "study",
    groupId: study.groupId,
    studyId: study.studyId,
    name: study.name,
    lastSession: study.lastSession || null
  };
};

export const determineBestPath = async (): Promise<Path> => {
  const activeVariants = await getActiveVariants();
  const studyGroups = await getStudyGroups();
  
  const variantToReview = findVariantToReview(activeVariants);
  const studyToReview = findStudyToReview(studyGroups);
  
  if (variantToReview && (!studyToReview || variantToReview.errors > 0)) {
    return await createVariantPath(variantToReview);
  } else if (studyToReview) {
    return createStudyPath(studyToReview);
  } else {
    return { message: "No variants or studies to review." };
  }
};