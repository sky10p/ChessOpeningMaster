import { MoveVariantNode } from "@chess-opening-master/common";
import {
  buildMistakeKey,
  buildPendingVariantReview,
  computeNextMastery,
  buildVariantStartState,
  getAllowedMovesFromTrainVariants,
  getDefaultTrainVariants,
  getOpeningNameFromVariant,
  getTotalTrainingErrors,
  mergeMistakesByKey,
  removePendingReviewByVariantName,
  removeVariantFromStartFens,
  removeVariantFromStartTimes,
} from "../TrainRepertoireContext.utils";
import { TrainVariant, Variant } from "../../models/chess.models";

const createVariant = (name: string): Variant => ({
  name,
  fullName: `Opening: ${name}`,
  differentMoves: "",
  moves: [],
});

const createMoveNode = (id: string, position = 1): MoveVariantNode => {
  const node = new MoveVariantNode();
  node.id = id;
  node.position = position;
  return node;
};

describe("TrainRepertoireContext.utils", () => {
  it("filters default train variants by single variant name", () => {
    const variants = [createVariant("A"), createVariant("B")];

    const result = getDefaultTrainVariants(variants, "Opening: A");

    expect(result).toHaveLength(1);
    expect(result[0].variant.fullName).toBe("Opening: A");
    expect(result[0].state).toBe("inProgress");
  });

  it("filters default train variants by variantNames set using fullName or name", () => {
    const variants = [createVariant("A"), createVariant("B"), createVariant("C")];

    const result = getDefaultTrainVariants(variants, undefined, new Set(["Opening: A", "B"]));

    expect(result.map((item) => item.variant.name)).toEqual(["A", "B"]);
  });

  it("builds variant start state for selected variants", () => {
    const selected: TrainVariant[] = [
      { variant: createVariant("A"), state: "inProgress" },
      { variant: createVariant("B"), state: "inProgress" },
    ];

    const result = buildVariantStartState(selected, 1000, "start-fen");

    expect(result.startTimes["Opening: A"]).toBe(1000);
    expect(result.startTimes["Opening: B"]).toBe(1000);
    expect(result.startFens["Opening: A"]).toBe("start-fen");
    expect(result.startFens["Opening: B"]).toBe("start-fen");
  });

  it("returns unique allowed moves from in-progress variants", () => {
    const sharedMove = createMoveNode("e2e4");
    const otherMove = createMoveNode("d2d4");

    const trainVariants: TrainVariant[] = [
      {
        variant: { ...createVariant("A"), moves: [sharedMove] },
        state: "inProgress",
      },
      {
        variant: { ...createVariant("B"), moves: [sharedMove] },
        state: "inProgress",
      },
      {
        variant: { ...createVariant("C"), moves: [otherMove] },
        state: "discarded",
      },
    ];

    const result = getAllowedMovesFromTrainVariants(trainVariants, 0);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("e2e4");
  });

  it("resolves allowed move by ply position when array index does not match", () => {
    const targetMove = createMoveNode("g1f3", 5);
    const trainVariants: TrainVariant[] = [
      {
        variant: {
          ...createVariant("A"),
          moves: [createMoveNode("e2e4", 1), targetMove, createMoveNode("f1b5", 6)],
        },
        state: "inProgress",
      },
    ];

    const result = getAllowedMovesFromTrainVariants(trainVariants, 4);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("g1f3");
  });

  it("removes variant keys from start maps", () => {
    expect(removeVariantFromStartTimes({ a: 1, b: 2 }, "a")).toEqual({ b: 2 });
    expect(removeVariantFromStartFens({ a: "f1", b: "f2" }, "a")).toEqual({ b: "f2" });
  });

  it("removes pending review from queue head and from list by name", () => {
    const reviews = [
      { variantName: "A", value: 1 },
      { variantName: "B", value: 2 },
      { variantName: "A", value: 3 },
    ];

    expect(removePendingReviewByVariantName(reviews, "A")).toEqual([
      { variantName: "B", value: 2 },
      { variantName: "A", value: 3 },
    ]);

    expect(removePendingReviewByVariantName(reviews.slice(1), "A")).toEqual([
      { variantName: "B", value: 2 },
    ]);
  });

  it("extracts opening name prefix from variant name", () => {
    expect(getOpeningNameFromVariant("Sicilian Defense: Najdorf")).toBe("Sicilian Defense");
    expect(getOpeningNameFromVariant("French Defense")).toBe("French Defense");
  });

  it("computes total training errors", () => {
    expect(getTotalTrainingErrors(2, 3)).toBe(5);
  });

  it("builds pending review with suggested rating from combined errors", () => {
    const result = buildPendingVariantReview({
      variantName: "Opening: A",
      openingName: "Opening",
      startingFen: "fen",
      wrongMoves: 1,
      ignoredWrongMoves: 1,
      hintsUsed: 0,
      timeSpentSec: 90,
    });

    expect(result.suggestedRating).toBe("hard");
    expect(result.wrongMoves).toBe(1);
    expect(result.ignoredWrongMoves).toBe(1);
  });

  it("preserves explicit suggested rating override", () => {
    const result = buildPendingVariantReview({
      variantName: "Opening: A",
      openingName: "Opening",
      startingFen: "fen",
      wrongMoves: 0,
      ignoredWrongMoves: 0,
      hintsUsed: 0,
      timeSpentSec: 20,
      suggestedRating: "good",
    });

    expect(result.suggestedRating).toBe("good");
  });

  it("builds deterministic mistake key", () => {
    expect(buildMistakeKey("Sicilian", 12, "d7d6", 2)).toBe(
      "Sicilian::12::d7d6::2"
    );
  });

  it("merges mistakes by key keeping latest payload", () => {
    const merged = mergeMistakesByKey(
      [
        {
          mistakeKey: "A::1::e2e4::0",
          mistakePly: 1,
          variantStartPly: 0,
          positionFen: "fen-1",
          expectedMoveLan: "e2e4",
          expectedMoveSan: "e4",
        },
      ],
      [
        {
          mistakeKey: "A::1::e2e4::0",
          mistakePly: 1,
          variantStartPly: 0,
          positionFen: "fen-2",
          expectedMoveLan: "e2e4",
          expectedMoveSan: "e4",
          actualMoveLan: "g1f3",
        },
      ]
    );
    expect(merged).toHaveLength(1);
    expect(merged[0].positionFen).toBe("fen-2");
    expect(merged[0].actualMoveLan).toBe("g1f3");
  });

  it("computes mastery score bounded by formula", () => {
    const mastery = computeNextMastery({
      previousMastery: 60,
      rating: "good",
      wrongMoves: 1,
      ignoredWrongMoves: 0,
      hintsUsed: 0,
    });

    expect(mastery).toBeGreaterThanOrEqual(0);
    expect(mastery).toBeLessThanOrEqual(100);
  });
});
