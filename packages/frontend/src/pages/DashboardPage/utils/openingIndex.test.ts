import { IRepertoireDashboard } from "@chess-opening-master/common";
import { Color, PieceSymbol, Square } from "chess.js";
import {
  buildDashboardOpeningIndex,
  getOpeningRepertoires,
  getOpeningTrainVariants,
} from "./openingIndex";

const validMove = {
  from: "e2" as Square,
  to: "e4" as Square,
  lan: "e2e4",
  san: "e4",
  color: "w" as Color,
  flags: "b",
  piece: "p" as PieceSymbol,
  before: "start_fen",
  after: "after_e2e4_fen",
};

const openingMoveNode = (name: string) => ({
  id: "root",
  move: null,
  children: [
    {
      id: `${name}-start`,
      move: validMove,
      variantName: name,
      children: [
        {
          id: `${name}-main`,
          move: {
            ...validMove,
            from: "e7" as Square,
            to: "e5" as Square,
            lan: "e7e5",
            san: "e5",
            color: "b" as Color,
            before: "after_e2e4_fen",
            after: "after_e7e5_fen",
          },
          children: [],
        },
      ],
    },
  ],
});

const makeRepertoire = (
  id: string,
  name: string,
  orientation: "white" | "black",
  openingName: string
): IRepertoireDashboard => ({
  _id: id,
  name,
  orientation,
  moveNodes: openingMoveNode(openingName),
  variantsInfo: [],
  order: 0,
});

describe("openingIndex", () => {
  it("builds shared opening membership and orientation-aware lookups", () => {
    const repertoires = [
      makeRepertoire("rep-1", "White Rep", "white", "Italian Game"),
      makeRepertoire("rep-2", "Black Rep", "black", "Italian Game"),
      makeRepertoire("rep-3", "French Rep", "black", "French Defense"),
    ];

    const openingIndex = buildDashboardOpeningIndex(repertoires);

    expect(openingIndex.openings).toEqual(["French Defense", "Italian Game"]);
    expect(openingIndex.openingToRepertoireId.get("Italian Game")).toBe("rep-1");
    expect(getOpeningRepertoires(openingIndex, "Italian Game", "white")).toHaveLength(1);
    expect(getOpeningRepertoires(openingIndex, "Italian Game", "all")).toHaveLength(2);
    expect(getOpeningTrainVariants(openingIndex, "French Defense", "black")).toHaveLength(1);
  });
});
