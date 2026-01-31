import { VariantState } from "./Variants";
import { BoardOrientation } from "./Orientation";

export interface StudiedVariantPath {
  type: "variant";
  id: string;
  repertoireId: string;
  repertoireName: string;
  name: string;
  errors: number;
  lastDate: Date;
  easeFactor?: number;
  interval?: number;
  repetitions?: number;
  state?: VariantState;
  dueDate?: Date;
  lapses?: number;
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

export interface PositionErrorPath {
  type: "positionError";
  id: string;
  repertoireId: string;
  repertoireName: string;
  variantName: string;
  orientation: BoardOrientation;
  fen: string;
  wrongMove: string;
  expectedMoves: string[];
  errorCount: number;
  lastErrorDate: Date;
}

export interface EmptyPath {
  message: string;
}

export type Path = StudiedVariantPath | NewVariantPath | StudyPath | PositionErrorPath | EmptyPath;

export type PathCategory = 'dueVariants' | 'variantsWithErrors' | 'newVariants' | 'oldVariants' | 'studyToReview' | 'positionsWithErrors';
