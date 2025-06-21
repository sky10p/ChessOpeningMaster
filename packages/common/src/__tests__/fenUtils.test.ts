import { getOrientationAwareFen } from "../utils/fenUtils";
import { BoardOrientation } from "../types/Orientation";

describe("fenUtils", () => {  describe("getOrientationAwareFen", () => {
    const standardStartingPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const flippedStartingPosition = "rnbkqbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBKQBNR b KQkq - 0 1";

    describe("when orientation is white or undefined", () => {
      it("should return the original FEN when orientation is white", () => {
        const result = getOrientationAwareFen(standardStartingPosition, "white");
        expect(result).toBe(standardStartingPosition);
      });

      it("should return the original FEN when orientation is undefined", () => {
        const result = getOrientationAwareFen(standardStartingPosition, undefined);
        expect(result).toBe(standardStartingPosition);
      });
    });

    describe("when orientation is black", () => {
      it("should flip the starting position correctly", () => {
        const result = getOrientationAwareFen(standardStartingPosition, "black");
        expect(result).toBe(flippedStartingPosition);
      });      it("should flip piece colors correctly", () => {
        const fen = "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4";
        const result = getOrientationAwareFen(fen, "black");
        expect(result).toBe("r2kqbnr/ppp1pppp/2n5/3p1b2/3P4/2N2N2/PPP1PPPP/R1BKQB1R b KQkq - 4 4");
      });

      it("should flip turn correctly", () => {
        const whiteTurnFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        const blackTurnFen = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1";
        
        const whiteResult = getOrientationAwareFen(whiteTurnFen, "black");
        const blackResult = getOrientationAwareFen(blackTurnFen, "black");
        
        expect(whiteResult.split(" ")[1]).toBe("b");
        expect(blackResult.split(" ")[1]).toBe("w");
      });      it("should flip castling rights correctly", () => {
        const fenWithCastling = "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1";
        const result = getOrientationAwareFen(fenWithCastling, "black");
        expect(result.split(" ")[2]).toBe("KQkq");
      });

      it("should handle partial castling rights", () => {
        const fenWithPartialCastling = "r3k2r/8/8/8/8/8/8/R3K2R w Kq - 0 1";
        const result = getOrientationAwareFen(fenWithPartialCastling, "black");
        expect(result.split(" ")[2]).toBe("Qk");
      });

      it("should handle no castling rights", () => {
        const fenWithoutCastling = "r3k2r/8/8/8/8/8/8/R3K2R w - - 0 1";
        const result = getOrientationAwareFen(fenWithoutCastling, "black");
        expect(result.split(" ")[2]).toBe("-");
      });

      it("should flip en passant squares correctly", () => {
        const fenWithEnPassant3 = "rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3";
        const fenWithEnPassant6 = "rnbqkbnr/pppp1ppp/8/8/3Pp3/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 3";
        
        const result3 = getOrientationAwareFen(fenWithEnPassant3, "black");
        const result6 = getOrientationAwareFen(fenWithEnPassant6, "black");
        
        expect(result3.split(" ")[3]).toBe("d3");
        expect(result6.split(" ")[3]).toBe("d6");
      });

      it("should handle no en passant square", () => {
        const fenWithoutEnPassant = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        const result = getOrientationAwareFen(fenWithoutEnPassant, "black");
        expect(result.split(" ")[3]).toBe("-");
      });

      it("should preserve halfmove and fullmove counters", () => {
        const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 5 10";
        const result = getOrientationAwareFen(fen, "black");
        const parts = result.split(" ");
        expect(parts[4]).toBe("5");
        expect(parts[5]).toBe("10");
      });      it("should handle complex positions with numbers in board representation", () => {
        const fen = "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 4";
        const result = getOrientationAwareFen(fen, "black");
        
        const resultParts = result.split(" ");
        expect(resultParts[0]).toBe("r2kqbnr/ppp2ppp/2n1p3/3p1b2/3P1B2/2N2N2/PPP1PPPP/R2KQB1R");
        expect(resultParts[1]).toBe("b");
        expect(resultParts[2]).toBe("KQkq");
      });      it("should perform correct 180° board rotation", () => {
        const asymmetricPosition = "r7/8/8/8/8/8/8/7R w - - 0 1";
        const result = getOrientationAwareFen(asymmetricPosition, "black");
        expect(result.split(" ")[0]).toBe("r7/8/8/8/8/8/8/7R");
      });

      it("should correctly flip truly asymmetric positions", () => {
        const asymmetricPosition = "r6R/8/8/8/8/8/8/8 w - - 0 1";
        const result = getOrientationAwareFen(asymmetricPosition, "black");
        expect(result.split(" ")[0]).toBe("8/8/8/8/8/8/8/r6R");
      });      it("should correctly flip complex asymmetric piece placements", () => {
        const asymmetricPosition = "Q1b4k/1n6/8/3P4/2p5/8/6N1/K4B1q w - - 0 1";
        const result = getOrientationAwareFen(asymmetricPosition, "black");
        expect(result.split(" ")[0]).toBe("Q1b4k/1n6/8/5P2/4p3/8/6N1/K4B1q");
      });

      it("should handle asymmetric positions with mixed piece types", () => {
        const asymmetricPosition = "8/1Q6/8/8/8/8/6q1/8 w - - 0 1";
        const result = getOrientationAwareFen(asymmetricPosition, "black");
        expect(result.split(" ")[0]).toBe("8/1Q6/8/8/8/8/6q1/8");
      });

      it("should correctly rotate diagonal asymmetric patterns", () => {
        const diagonalPattern = "N7/1n6/2B5/3b4/4p3/5P2/6r1/7R w - - 0 1";
        const result = getOrientationAwareFen(diagonalPattern, "black");
        expect(result.split(" ")[0]).toBe("r7/1R6/2p5/3P4/4B3/5b2/6N1/7n");
      });      it("should handle edge files and ranks asymmetry", () => {
        const edgeAsymmetric = "n6N/8/8/8/8/8/8/p6P w - - 0 1";
        const result = getOrientationAwareFen(edgeAsymmetric, "black");
        expect(result.split(" ")[0]).toBe("p6P/8/8/8/8/8/8/n6N");
      });      it("should handle comprehensive asymmetric board coverage", () => {
        const complexAsymmetric = "r1b1k1n1/1p1p1p1p/8/8/8/8/1P1P1P1P/1N1K1B1R w - - 0 1";
        const result = getOrientationAwareFen(complexAsymmetric, "black");
        expect(result.split(" ")[0]).toBe("r1b1k1n1/p1p1p1p1/8/8/8/8/P1P1P1P1/1N1K1B1R");
      });
    });

    describe("edge cases", () => {
      it("should return original FEN if it has wrong number of parts", () => {
        const invalidFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq";
        const result = getOrientationAwareFen(invalidFen, "black");
        expect(result).toBe(invalidFen);
      });

      it("should handle empty string", () => {
        const result = getOrientationAwareFen("", "black");
        expect(result).toBe("");
      });

      it("should handle FEN with unusual file letters in en passant", () => {
        const fenWithEnPassantA = "rnbqkbnr/1ppppppp/8/p7/P7/8/1PPPPPPP/RNBQKBNR w KQkq a6 0 2";
        const fenWithEnPassantH = "rnbqkbnr/ppppppp1/8/7p/7P/8/PPPPPPP1/RNBQKBNR w KQkq h6 0 2";
        
        const resultA = getOrientationAwareFen(fenWithEnPassantA, "black");
        const resultH = getOrientationAwareFen(fenWithEnPassantH, "black");
        
        expect(resultA.split(" ")[3]).toBe("a3");
        expect(resultH.split(" ")[3]).toBe("h3");
      });

      it("should handle position with maximum empty squares", () => {
        const fenWithEights = "8/8/8/8/8/8/8/8 w - - 0 1";
        const result = getOrientationAwareFen(fenWithEights, "black");
        expect(result).toBe("8/8/8/8/8/8/8/8 b - - 0 1");
      });      it("should handle mixed case pieces correctly", () => {
        const fen = "RnBqKbNr/pppppppp/8/8/8/8/PPPPPPPP/rNbQkBnR w - - 0 1";
        const result = getOrientationAwareFen(fen, "black");
        expect(result.split(" ")[0]).toBe("rNbKqBnR/pppppppp/8/8/8/8/PPPPPPPP/RnBkQbNr");
      });
    });    describe("type safety", () => {
      it("should work with explicit BoardOrientation types", () => {
        const whiteOrientation: BoardOrientation = "white";
        const blackOrientation: BoardOrientation = "black";
        
        const whiteResult = getOrientationAwareFen(standardStartingPosition, whiteOrientation);
        const blackResult = getOrientationAwareFen(standardStartingPosition, blackOrientation);
        
        expect(whiteResult).toBe(standardStartingPosition);
        expect(blackResult).toBe(flippedStartingPosition);
      });
    });
  });
});
