import { DateType } from "../utils/dateUtils";

export interface StudiedVariantPath {
  type: "variant";
  id: string;
  repertoireId: string;
  repertoireName: string;
  name: string;
  errors: number;
  lastDate: DateType;
}

export interface NewVariantPath {
  type: "newVariant";
  repertoireId: string;
  repertoireName: string;
  name: string;
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

export type Path = StudiedVariantPath | NewVariantPath | StudyPath | EmptyPath;
