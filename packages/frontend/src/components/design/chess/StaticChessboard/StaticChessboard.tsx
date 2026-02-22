import React, { useMemo } from "react";
import { Chess } from "chess.js";
import { PIECES } from "./pieces";

const LIGHT_SQUARE = "#F0D9B5";
const DARK_SQUARE = "#B58863";

const WHITE_RANKS = [0, 1, 2, 3, 4, 5, 6, 7] as const;
const BLACK_RANKS = [7, 6, 5, 4, 3, 2, 1, 0] as const;
const WHITE_FILES = [0, 1, 2, 3, 4, 5, 6, 7] as const;
const BLACK_FILES = [7, 6, 5, 4, 3, 2, 1, 0] as const;

interface StaticChessboardProps {
  fen: string;
  orientation?: "white" | "black";
}

const getAccessibleBoardLabel = (fen: string): string => {
  try {
    const chess = new Chess(fen);
    const turn = chess.turn() === "w" ? "White" : "Black";
    return `Chess board position, ${turn} to move`;
  } catch {
    return "Chess board position";
  }
};

export const StaticChessboard = React.memo<StaticChessboardProps>(
  ({ fen, orientation = "white" }) => {
    const board = useMemo(() => {
      try {
        return new Chess(fen).board();
      } catch {
        return new Chess().board();
      }
    }, [fen]);

    const rankIndices = orientation === "white" ? WHITE_RANKS : BLACK_RANKS;
    const fileIndices = orientation === "white" ? WHITE_FILES : BLACK_FILES;

    return (
      <div
        role="img"
        aria-label={getAccessibleBoardLabel(fen)}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(8, 1fr)",
          gridTemplateRows: "repeat(8, 1fr)",
          aspectRatio: "1 / 1",
          width: "100%",
        }}
      >
        {rankIndices.map((rankIdx, rowVisual) =>
          fileIndices.map((fileIdx, colVisual) => {
            const isLight = (rankIdx + fileIdx) % 2 === 0;
            const piece = board[rankIdx][fileIdx];
            const pieceKey = piece
              ? `${piece.color}${piece.type.toUpperCase()}`
              : null;
            const pieceNode = pieceKey ? PIECES[pieceKey] : null;
            return (
              <div
                key={`${rowVisual}-${colVisual}`}
                aria-hidden="true"
                style={{
                  backgroundColor: isLight ? LIGHT_SQUARE : DARK_SQUARE,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {pieceNode}
              </div>
            );
          })
        )}
      </div>
    );
  }
);

StaticChessboard.displayName = "StaticChessboard";
