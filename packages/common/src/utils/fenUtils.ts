import { BoardOrientation } from "../types/Orientation";

export const getOrientationAwareFen = (fen: string, orientation: BoardOrientation | undefined): string => {
  if (!orientation || orientation === "white") {
    return fen;
  }

  const parts = fen.split(" ");
  if (parts.length !== 6) {
    return fen;
  }

  const [position, turn, castling, enPassant, halfmove, fullmove] = parts;

  const flippedPosition = flipBoardPosition(position);
  const flippedTurn = turn === "w" ? "b" : "w";
  const flippedCastling = flipCastlingRights(castling);
  const flippedEnPassant = flipEnPassantSquare(enPassant);

  return [flippedPosition, flippedTurn, flippedCastling, flippedEnPassant, halfmove, fullmove].join(" ");
};

const flipBoardPosition = (position: string): string => {
  const ranks = position.split("/");
  const flippedRanks = ranks.reverse().map(rank => {
    return rank.split("").map(char => {
      if (char >= "1" && char <= "8") {
        return char;
      }
      return char === char.toLowerCase() ? char.toUpperCase() : char.toLowerCase();
    }).join("");
  });
  return flippedRanks.join("/");
};

const flipCastlingRights = (castling: string): string => {
  if (castling === "-") return castling;
  
  return castling.split("").map(char => {
    switch (char) {
      case "K": return "k";
      case "Q": return "q";
      case "k": return "K";
      case "q": return "Q";
      default: return char;
    }
  }).sort((a, b) => {
    const order = "KQkq";
    return order.indexOf(a) - order.indexOf(b);
  }).join("");
};

const flipEnPassantSquare = (enPassant: string): string => {
  if (enPassant === "-") return enPassant;
  
  const file = enPassant[0];
  const rank = enPassant[1];
  const flippedRank = rank === "3" ? "6" : rank === "6" ? "3" : rank;
  
  return file + flippedRank;
};
