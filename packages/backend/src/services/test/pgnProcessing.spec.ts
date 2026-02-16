import { buildFallbackDedupeKey, detectOpening, parsePgnGames, splitPgnGames } from "../games/pgnProcessing";

describe("pgnProcessing", () => {
  it("parses multi-game PGN payload", () => {
    const raw = `[Event "Game 1"]\n[White "Alice"]\n[Black "Bob"]\n[Result "1-0"]\n\n1. e4 e5 2. Nf3 Nc6 1-0\n\n[Event "Game 2"]\n[White "Carol"]\n[Black "Dave"]\n[Result "0-1"]\n\n1. d4 d5 2. c4 e6 0-1`;
    const chunks = splitPgnGames(raw);
    expect(chunks).toHaveLength(2);
    const parsed = parsePgnGames(raw);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].headers.White).toBe("Alice");
    expect(parsed[1].movesSan.slice(0, 2)).toEqual(["d4", "d5"]);
  });

  it("uses eco and opening headers for opening detection", () => {
    const opening = detectOpening({ ECO: "C20", Opening: "King Pawn Game" }, ["e4", "e5", "Nf3", "Nc6"]);
    expect(opening.eco).toBe("C20");
    expect(opening.openingName).toBe("King Pawn Game");
    expect(opening.confidence).toBeGreaterThan(0.9);
    expect(opening.lineKey).toHaveLength(16);
  });

  it("produces stable fallback dedupe key", () => {
    const keyA = buildFallbackDedupeKey("2024-01-01T00:00:00.000Z", "Alice", "Bob", "1-0", ["e4", "e5"]);
    const keyB = buildFallbackDedupeKey("2024-01-01T00:00:00.000Z", "Alice", "Bob", "1-0", ["e4", "e5"]);
    expect(keyA).toBe(keyB);
  });
});
