import { buildOpeningMapping, nameSimilarity } from "../games/openingMappingService";
import * as repertoireMetadataService from "../games/repertoireMetadataService";

jest.mock("../games/repertoireMetadataService", () => ({
  getRepertoireMetadataById: jest.fn(),
  getBestVariantMatch: jest.requireActual("../games/repertoireMetadataService").getBestVariantMatch,
}));

describe("openingMappingService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns perfect similarity for equal names", () => {
    expect(nameSimilarity("Sicilian Defense", "Sicilian Defense")).toBe(1);
  });

  it("marks low confidence mapping for manual review", async () => {
    (repertoireMetadataService.getRepertoireMetadataById as jest.Mock).mockResolvedValueOnce(new Map([
      ["rep-1", {
        repertoireId: "rep-1",
        repertoireName: "French Defense",
        variants: [
          { fullName: "French: Exchange", name: "Exchange", movesSan: ["e4", "e6", "d4", "d5"] },
        ],
      }],
    ]));

    const mapping = await buildOpeningMapping(
      "user-1",
      "white",
      "Sicilian Defense",
      undefined,
      ["e4", "c5"]
    );

    expect(mapping.requiresManualReview).toBe(true);
    expect(mapping.strategy).toBe("movePrefix");
  });

  it("selects movePrefix strategy with high confidence", async () => {
    (repertoireMetadataService.getRepertoireMetadataById as jest.Mock).mockResolvedValueOnce(new Map([
      ["rep-1", {
        repertoireId: "rep-1",
        repertoireName: "Sicilian Defense",
        variants: [
          { fullName: "Sicilian: Open", name: "Open", movesSan: ["e4", "c5", "Nf3", "d6"] },
        ],
      }],
    ]));

    const mapping = await buildOpeningMapping(
      "user-1",
      "white",
      "Sicilian Defense",
      undefined,
      ["e4", "c5", "Nf3", "d6"]
    );

    expect(mapping.repertoireId).toBe("rep-1");
    expect(mapping.variantName).toBe("Sicilian: Open");
    expect(mapping.strategy).toBe("movePrefix");
    expect(mapping.requiresManualReview).toBe(false);
  });

  it("does not require manual review at exact confidence threshold", async () => {
    (repertoireMetadataService.getRepertoireMetadataById as jest.Mock).mockResolvedValueOnce(new Map([
      ["rep-1", {
        repertoireId: "rep-1",
        repertoireName: "Ruy Lopez",
        variants: [
          { fullName: "Ruy Lopez Main", name: "Main", movesSan: ["e4", "e5", "Nf3", "Nc6"] },
        ],
      }],
    ]));

    const mapping = await buildOpeningMapping(
      "user-1",
      "white",
      undefined,
      undefined,
      ["e4", "e5", "Nf3", "a6"]
    );

    expect(mapping.confidence).toBe(0.75);
    expect(mapping.strategy).toBe("movePrefix");
    expect(mapping.requiresManualReview).toBe(false);
  });

  it("uses tag overlap strategy when no stronger signal exists", async () => {
    (repertoireMetadataService.getRepertoireMetadataById as jest.Mock).mockResolvedValueOnce(new Map([
      ["rep-1", {
        repertoireId: "rep-1",
        repertoireName: "Caro Kann",
        variants: [
          { fullName: "Caro Kann Classical", name: "Classical", movesSan: ["e4", "c6", "d4", "d5"] },
        ],
      }],
    ]));

    const mapping = await buildOpeningMapping(
      "user-1",
      "white",
      "Unrelated Opening",
      undefined,
      ["d4", "Nf6"],
      ["kann"]
    );

    expect(mapping.strategy).toBe("tagOverlap");
    expect(mapping.confidence).toBe(0.76);
    expect(mapping.requiresManualReview).toBe(false);
  });

  it("prefers eco strategy over weaker fuzzy mapping", async () => {
    (repertoireMetadataService.getRepertoireMetadataById as jest.Mock).mockResolvedValueOnce(new Map([
      ["rep-1", {
        repertoireId: "rep-1",
        repertoireName: "B20 Sicilian Defense",
        variants: [
          { fullName: "Sicilian Open", name: "Open", movesSan: ["e4", "c5", "Nf3", "d6"] },
        ],
      }],
    ]));

    const mapping = await buildOpeningMapping(
      "user-1",
      "white",
      "Defense",
      "B20",
      ["d4", "Nf6"]
    );

    expect(mapping.strategy).toBe("eco");
    expect(mapping.confidence).toBe(0.92);
    expect(mapping.requiresManualReview).toBe(false);
  });
});
