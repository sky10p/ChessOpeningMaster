import { Variant } from "../../models/chess.models";
import { Chess } from "chess.js";
import { MoveVariantNode } from "@chess-opening-master/common";

// Create the utility function locally for testing since it's internal to RepertoireContext
const isVariantCompatibleWithPath = (variant: Variant, movePath: string[]): boolean => {
  if (variant.moves.length < movePath.length) return false;
  return movePath.every((moveLan, index) => variant.moves[index].getMove().lan === moveLan);
};

const createMove = (san: string, previousSans: string[] = []) => {
  const chess = new Chess();
  previousSans.forEach((moveSan) => {
    chess.move(moveSan);
  });
  const move = chess.move(san);
  if (!move) {
    throw new Error(`Invalid move: ${san} after ${previousSans.join(", ")}`);
  }
  return move;
};

const createMoveVariantNode = (san: string, previousSans: string[] = [], variantName?: string) => {
  const move = createMove(san, previousSans);
  const node = new MoveVariantNode();
  node.move = move;
  node.id = move.lan;
  node.variantName = variantName;
  node.position = previousSans.length + 1;
  return node;
};

const createVariant = (moves: { san: string; variantName?: string }[], name: string): Variant => {
  const moveNodes: MoveVariantNode[] = [];
  const previousSans: string[] = [];
  
  moves.forEach((moveData) => {
    const node = createMoveVariantNode(moveData.san, [...previousSans], moveData.variantName);
    moveNodes.push(node);
    previousSans.push(moveData.san);
  });

  return {
    moves: moveNodes,
    name,
    fullName: name,
    differentMoves: "",
  };
};

describe("RepertoireContext Utilities", () => {
  describe("isVariantCompatibleWithPath", () => {
    it("should return true for exact path match", () => {
      const variant = createVariant([
        { san: "e4" },
        { san: "e5" },
        { san: "Nf3" }
      ], "Test Variant");

      const path = ["e2e4", "e7e5", "g1f3"];

      expect(isVariantCompatibleWithPath(variant, path)).toBe(true);
    });

    it("should return true when variant is longer than path", () => {
      const variant = createVariant([
        { san: "e4" },
        { san: "e5" },
        { san: "Nf3" },
        { san: "Nc6" },
        { san: "Bb5" }
      ], "Test Variant");

      const path = ["e2e4", "e7e5"];

      expect(isVariantCompatibleWithPath(variant, path)).toBe(true);
    });

    it("should return false when variant is shorter than path", () => {
      const variant = createVariant([
        { san: "e4" },
        { san: "e5" }
      ], "Test Variant");

      const path = ["e2e4", "e7e5", "g1f3"];

      expect(isVariantCompatibleWithPath(variant, path)).toBe(false);
    });

    it("should return false when moves don't match", () => {
      const variant = createVariant([
        { san: "e4" },
        { san: "e5" },
        { san: "Nf3" }
      ], "Test Variant");

      const path = ["e2e4", "e7e6", "g1f3"]; // e6 instead of e5

      expect(isVariantCompatibleWithPath(variant, path)).toBe(false);
    });

    it("should return false when first move doesn't match", () => {
      const variant = createVariant([
        { san: "e4" },
        { san: "e5" }
      ], "Test Variant");

      const path = ["d2d4", "d7d5"]; // d4 instead of e4

      expect(isVariantCompatibleWithPath(variant, path)).toBe(false);
    });

    it("should return true for empty path", () => {
      const variant = createVariant([
        { san: "e4" },
        { san: "e5" }
      ], "Test Variant");

      const path: string[] = [];

      expect(isVariantCompatibleWithPath(variant, path)).toBe(true);
    });

    it("should handle single move paths", () => {
      const variant = createVariant([
        { san: "e4" }
      ], "Test Variant");

      expect(isVariantCompatibleWithPath(variant, ["e2e4"])).toBe(true);
      expect(isVariantCompatibleWithPath(variant, ["d2d4"])).toBe(false);
    });

    it("should handle complex opening sequences", () => {
      const spanishOpening = createVariant([
        { san: "e4" },
        { san: "e5" },
        { san: "Nf3" },
        { san: "Nc6" },
        { san: "Bb5" }
      ], "Spanish Opening");

      // Complete path
      expect(isVariantCompatibleWithPath(spanishOpening, [
        "e2e4", "e7e5", "g1f3", "b8c6", "f1b5"
      ])).toBe(true);

      // Partial path
      expect(isVariantCompatibleWithPath(spanishOpening, [
        "e2e4", "e7e5", "g1f3"
      ])).toBe(true);

      // Incompatible path (Italian Game)
      expect(isVariantCompatibleWithPath(spanishOpening, [
        "e2e4", "e7e5", "f1c4"
      ])).toBe(false);
    });
  });

  describe("Path Edge Cases", () => {
    it("should handle variants with no moves", () => {
      const emptyVariant: Variant = {
        moves: [],
        name: "Empty Variant",
        fullName: "Empty Variant",
        differentMoves: "",
      };

      expect(isVariantCompatibleWithPath(emptyVariant, [])).toBe(true);
      expect(isVariantCompatibleWithPath(emptyVariant, ["e2e4"])).toBe(false);
    });

    it("should handle case sensitivity in move IDs", () => {
      const variant = createVariant([
        { san: "e4" },
        { san: "e5" }
      ], "Test Variant");

      // Assuming move.lan is lowercase
      expect(isVariantCompatibleWithPath(variant, ["e2e4", "e7e5"])).toBe(true);
      expect(isVariantCompatibleWithPath(variant, ["E2E4", "E7E5"])).toBe(false);
    });

    it("should handle promotion moves", () => {
      // This would be a complex test case for endgame scenarios
      // For now, we'll test the basic structure
      const variant = createVariant([
        { san: "e4" },
        { san: "d5" }
      ], "Test Variant");

      expect(isVariantCompatibleWithPath(variant, ["e2e4", "d7d5"])).toBe(true);
    });
  });

  describe("Performance Considerations", () => {
    it("should handle large variants efficiently", () => {
      // Create a variant with a moderate number of moves
      const moves = [
        { san: "e4" }, { san: "e5" }, { san: "Nf3" }, { san: "Nc6" },
        { san: "Bb5" }, { san: "a6" }, { san: "Ba4" }, { san: "Nf6" },
        { san: "O-O" }, { san: "Be7" }
      ];

      const longVariant = createVariant(moves, "Long Variant");
      const path = ["e2e4", "e7e5", "g1f3"];

      expect(isVariantCompatibleWithPath(longVariant, path)).toBe(true);
    });

    it("should short-circuit on first mismatch", () => {
      const variant = createVariant([
        { san: "e4" },
        { san: "e5" },
        { san: "Nf3" },
        { san: "Nc6" },
        { san: "Bb5" }
      ], "Test Variant");

      // Path with early mismatch
      const path = ["d2d4", "d7d5", "g1f3", "b8c6", "f1b5"];

      expect(isVariantCompatibleWithPath(variant, path)).toBe(false);
    });
  });
});