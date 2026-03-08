import {
  computeNextMastery,
  getVariantEntryPly,
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

  it("keeps exact entry ply at named anchor when no derived suffix exists", () => {
    expect(
      getVariantEntryPly({
        name: "Line A",
        fullName: "Opening: Line A",
        moves: [
          { position: 1 },
          { position: 2, variantName: "Line A", children: [{ position: 3 }] },
          { position: 3 },
        ],
      })
    ).toBe(2);
  });

  it("returns the last derived branch move for exact variant entry ply", () => {
    const root = { position: 0, children: [] as Array<{ position: number }> };
    const anchor = {
      position: 2,
      variantName: "Gambito escoces",
      parent: root,
      children: [] as Array<{ position: number }>,
    };
    const branchA = {
      position: 3,
      parent: anchor,
      children: [] as Array<{ position: number }>,
    };
    const branchB = {
      position: 4,
      parent: branchA,
      children: [] as Array<{ position: number }>,
    };
    const branchC = {
      position: 5,
      parent: branchB,
      children: [] as Array<{ position: number }>,
    };
    root.children = [anchor];
    anchor.children = [branchA, { position: 3 }];
    branchA.children = [branchB];
    branchB.children = [branchC, { position: 5 }];

    expect(
      getVariantEntryPly({
        name: "Gambito escoces",
        fullName: "Gambito escoces (4. ...Bc5 9. ...d6)",
        moves: [anchor, branchA, branchB, branchC],
      })
    ).toBe(5);
  });

  it("falls back safely for unnamed variants", () => {
    expect(
      getVariantEntryPly({
        name: "Variant 1",
        fullName: "Variant 1",
        moves: [{ position: 1 }, { position: 2 }],
      })
    ).toBe(0);
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
