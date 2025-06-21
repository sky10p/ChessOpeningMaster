import { toPGN, variantToPgn, addNodeToPgn } from "./pgn.utils";
import { MoveVariantNode } from "../../../models/VariantNode";
import { Variant } from "@chess-opening-master/common";
import * as positionsRepo from "../../../repository/positions/positions";
import { Chess } from "chess.js";

jest.mock("../../../repository/positions/positions");

const mockGetCommentsByFens = positionsRepo.getCommentsByFens as jest.MockedFunction<typeof positionsRepo.getCommentsByFens>;

describe("pgn.utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("toPGN", () => {
    it("should generate PGN with batch-fetched comments", async () => {
      const mockTree = new MoveVariantNode();
      const child1 = new MoveVariantNode();
      child1.move = {
        color: "w",
        piece: "p",
        from: "e2",
        to: "e4",
        san: "e4",
        flags: "b",
        lan: "e2e4",
        before: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        after: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
      };
      child1.turn = 1;
      mockTree.children = [child1];

      const mockCommentsMap = {
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1": "First move comment"
      };
      mockGetCommentsByFens.mockResolvedValue(mockCommentsMap);

      const result = await toPGN("Test Repertoire", new Date("2023-01-01"), "white", mockTree);

      expect(mockGetCommentsByFens).toHaveBeenCalledWith([
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1"
      ]);
      expect(result).toContain("1. e4 {First move comment}");
      expect(result).toContain('[Event "Test Repertoire"]');
      expect(result).toContain('[White "Test Repertoire"]');
      expect(result).toContain('[Black "?"]');
    });

    it("should handle empty tree", async () => {
      const mockTree = new MoveVariantNode();
      mockGetCommentsByFens.mockResolvedValue({});

      const result = await toPGN("Empty Repertoire", new Date("2023-01-01"), "black", mockTree);

      expect(mockGetCommentsByFens).toHaveBeenCalledWith([]);
      expect(result).toContain('[Event "Empty Repertoire"]');
      expect(result).toContain('[White "?"]');
      expect(result).toContain('[Black "Empty Repertoire"]');
      expect(result).toContain("*");
    });

    it("should handle tree with no comments", async () => {
      const mockTree = new MoveVariantNode();
      const child1 = new MoveVariantNode();
      child1.move = {
        color: "w",
        piece: "p",
        from: "e2",
        to: "e4",
        san: "e4",
        flags: "b",
        lan: "e2e4",
        before: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        after: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
      };
      child1.turn = 1;
      mockTree.children = [child1];

      mockGetCommentsByFens.mockResolvedValue({});

      const result = await toPGN("Test Repertoire", new Date("2023-01-01"), "white", mockTree);

      expect(result).toContain("1. e4");
      expect(result).not.toContain("{");
    });

    it("should handle multiple moves with variants", async () => {
      const mockTree = new MoveVariantNode();
      const child1 = new MoveVariantNode();
      child1.move = {
        color: "w",
        piece: "p",
        from: "e2",
        to: "e4",
        san: "e4",
        flags: "b",
        lan: "e2e4",
        before: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        after: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
      };
      child1.turn = 1;

      const child2 = new MoveVariantNode();
      child2.move = {
        color: "b",
        piece: "p",
        from: "e7",
        to: "e5",
        san: "e5",
        flags: "b",
        lan: "e7e5",
        before: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
        after: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      };
      child2.turn = 1;

      const variant = new MoveVariantNode();
      variant.move = {
        color: "b",
        piece: "p",
        from: "c7",
        to: "c5",
        san: "c5",
        flags: "b",
        lan: "c7c5",
        before: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
        after: "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      };
      variant.turn = 1;

      child1.children = [child2, variant];
      mockTree.children = [child1];

      const mockCommentsMap = {
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1": "King's pawn opening",
        "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2": "King's gambit accepted",
        "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2": "Sicilian defense"
      };
      mockGetCommentsByFens.mockResolvedValue(mockCommentsMap);

      const result = await toPGN("Complex Repertoire", new Date("2023-01-01"), "white", mockTree);

      expect(result).toContain("1. e4 {King's pawn opening}");
      expect(result).toContain("e5 {King's gambit accepted}");
      expect(result).toContain("(1... c5 {Sicilian defense})");
    });
  });

  describe("variantToPgn", () => {
    it("should generate PGN for variant with batch-fetched comments", async () => {      const mockVariant: Variant = {
        name: "Test Variant",
        fullName: "Test Opening: Test Variant",
        differentMoves: "2",
        moves: [
          {
            id: "1",
            move: {
              color: "w",
              piece: "p",
              from: "e2",
              to: "e4",
              san: "e4",
              flags: "b",
              lan: "e2e4",
              before: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
              after: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
            },
            children: []
          },
          {
            id: "2",
            move: {
              color: "b",
              piece: "p",
              from: "e7",
              to: "e5",
              san: "e5",
              flags: "b",
              lan: "e7e5",
              before: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
              after: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
            },
            children: []
          }
        ]
      };

      const mockCommentsMap = {
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1": "First move",
        "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2": "Second move"
      };
      mockGetCommentsByFens.mockResolvedValue(mockCommentsMap);

      const result = await variantToPgn(mockVariant, "white", new Date("2023-01-01"));

      expect(mockGetCommentsByFens).toHaveBeenCalledWith([
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
        "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2"
      ]);
      expect(result).toContain('[Event "Test Opening: Test Variant"]');
      expect(result).toContain("1. e4 {First move} 1... e5 {Second move}");
    });    it("should handle variant with no comments", async () => {
      const mockVariant: Variant = {
        name: "Test Variant",
        fullName: "Test Opening: Test Variant",
        differentMoves: "1",
        moves: [
          {
            id: "1",
            move: {
              color: "w",
              piece: "p",
              from: "e2",
              to: "e4",
              san: "e4",
              flags: "b",
              lan: "e2e4",
              before: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
              after: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
            },
            children: []
          }
        ]
      };

      mockGetCommentsByFens.mockResolvedValue({});

      const result = await variantToPgn(mockVariant, "black", new Date("2023-01-01"));

      expect(result).toContain('[Black "Test Opening: Test Variant"]');
      expect(result).toContain("1. e4");
      expect(result).not.toContain("{");
    });    it("should handle empty variant", async () => {
      const mockVariant: Variant = {
        name: "Empty Variant",
        fullName: "Empty Opening: Empty Variant",
        differentMoves: "0",
        moves: []
      };

      mockGetCommentsByFens.mockResolvedValue({});

      const result = await variantToPgn(mockVariant, "white", new Date("2023-01-01"));

      expect(mockGetCommentsByFens).toHaveBeenCalledWith([]);
      expect(result).toContain('[Event "Empty Opening: Empty Variant"]');
      expect(result).toContain("*");
    });
  });

  describe("addNodeToPgn", () => {
    it("should use comments from the provided comments map", async () => {
      const mockNode = new MoveVariantNode();
      const child = new MoveVariantNode();
      child.move = {
        color: "w",
        piece: "p",
        from: "e2",
        to: "e4",
        san: "e4",
        flags: "b",
        lan: "e2e4",
        before: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        after: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
      };
      child.turn = 1;
      mockNode.children = [child];

      const mockChess = new Chess();
      const mockCommentsMap = {
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1": "Opening move"
      };

      const result = await addNodeToPgn(mockNode, true, mockChess, mockCommentsMap);

      expect(result).toContain("1. e4 {Opening move}");
    });

    it("should handle nodes with no comments in map", async () => {
      const mockNode = new MoveVariantNode();
      const child = new MoveVariantNode();
      child.move = {
        color: "w",
        piece: "p",
        from: "e2",
        to: "e4",
        san: "e4",
        flags: "b",
        lan: "e2e4",
        before: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        after: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
      };
      child.turn = 1;
      mockNode.children = [child];

      const mockChess = new Chess();
      const mockCommentsMap = {};

      const result = await addNodeToPgn(mockNode, true, mockChess, mockCommentsMap);

      expect(result).toContain("1. e4");
      expect(result).not.toContain("{");
    });
  });
});
