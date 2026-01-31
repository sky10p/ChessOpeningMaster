import { BoardOrientation } from "./Orientation";

export interface PositionError {
  _id?: string;
  fen: string;
  repertoireId: string;
  variantName?: string;
  orientation: BoardOrientation;
  wrongMove: string;
  expectedMoves: string[];
  errorCount: number;
  lastErrorDate: Date;
  createdAt: Date;
}
