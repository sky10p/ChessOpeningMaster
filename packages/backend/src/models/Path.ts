import { DateType } from "../utils/dateUtils";

export interface VariantPath {
  type: "variant";
  id: string;
  repertoireId: string;
  repertoireName: string;
  name: string;
  errors: number;
  lastDate: DateType;
}

export interface StudyPath {
  type: "study";
  groupId: string;
  studyId: string;
  name: string;
  lastSession: string | null;
}

export interface EmptyPath {
  message: string;
}

export type Path = VariantPath | StudyPath | EmptyPath;
