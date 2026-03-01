import {
  computeNextMastery,
  getOpeningNameFromVariant,
  getVariantStartPly,
  mergeMistakeSnapshotItems,
  MistakeSnapshotItem,
} from "../index";

describe("trainDomain", () => {
  it("derives opening name from variant name", () => {
    expect(getOpeningNameFromVariant("Sicilian Defense: Najdorf")).toBe(
      "Sicilian Defense"
    );
    expect(getOpeningNameFromVariant("French Defense")).toBe("French Defense");
  });

  it("resolves named variant start ply", () => {
    expect(
      getVariantStartPly({
        name: "Line A",
        fullName: "Opening: Line A",
        moves: [
          { position: 1 },
          { position: 2, variantName: "Line A" },
          { position: 3 },
        ],
      })
    ).toBe(2);
  });

  it("merges mistake snapshots by key keeping latest payload", () => {
    const existing: MistakeSnapshotItem[] = [
      {
        mistakeKey: "A::1::e2e4::0",
        mistakePly: 1,
        variantStartPly: 0,
        positionFen: "fen-1",
        expectedMoveLan: "e2e4",
      },
    ];
    const incoming: MistakeSnapshotItem[] = [
      {
        mistakeKey: "A::1::e2e4::0",
        mistakePly: 1,
        variantStartPly: 0,
        positionFen: "fen-2",
        expectedMoveLan: "e2e4",
        actualMoveLan: "g1f3",
      },
    ];

    expect(mergeMistakeSnapshotItems(existing, incoming)).toEqual(incoming);
  });

  it("computes mastery score within bounds", () => {
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
