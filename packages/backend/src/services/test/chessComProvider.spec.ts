import { chessComProvider } from "../games/providers/chessComProvider";

const ORIGINAL_ENV = { ...process.env };

const VALID_PGN = "[Event \"Test\"]\n[Site \"Chess.com\"]\n[Date \"2025.01.01\"]\n[Round \"-\"]\n[White \"Alice\"]\n[Black \"Bob\"]\n[Result \"1-0\"]\n\n1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 1-0";

const createJsonResponse = (status: number, payload: unknown, headers?: Record<string, string>): Response => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => payload,
  headers: {
    get: (name: string) => {
      if (!headers) {
        return null;
      }
      return headers[name] ?? headers[name.toLowerCase()] ?? null;
    },
  },
} as unknown as Response);

describe("chessComProvider", () => {
  let fetchSpy: jest.SpiedFunction<typeof fetch>;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...ORIGINAL_ENV };
    process.env.CHESSCOM_RETRY_BASE_DELAY_MS = "0";
    process.env.CHESSCOM_RETRY_MAX_DELAY_MS = "0";
    process.env.CHESSCOM_ARCHIVE_REQUEST_DELAY_MS = "0";
    fetchSpy = jest.spyOn(global, "fetch");
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("retries monthly archive fetch on HTTP 429", async () => {
    process.env.CHESSCOM_RETRY_MAX_ATTEMPTS = "3";
    fetchSpy
      .mockResolvedValueOnce(createJsonResponse(200, { archives: ["https://api.chess.com/pub/player/test/games/2025/01"] }))
      .mockResolvedValueOnce(createJsonResponse(429, { games: [] }))
      .mockResolvedValueOnce(createJsonResponse(200, { games: [{ uuid: "g-1", pgn: VALID_PGN }] }));

    const result = await chessComProvider.importGames({ username: "test-user", max: 20 });

    expect(result.length).toBeGreaterThan(0);
    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });

  it("retries monthly archive fetch on network error", async () => {
    process.env.CHESSCOM_RETRY_MAX_ATTEMPTS = "3";
    fetchSpy
      .mockResolvedValueOnce(createJsonResponse(200, { archives: ["https://api.chess.com/pub/player/test/games/2025/01"] }))
      .mockRejectedValueOnce(new Error("network down"))
      .mockResolvedValueOnce(createJsonResponse(200, { games: [{ uuid: "g-2", pgn: VALID_PGN }] }));

    const result = await chessComProvider.importGames({ username: "test-user", max: 20 });

    expect(result.length).toBeGreaterThan(0);
    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });

  it("fails import when monthly archive retries are exhausted", async () => {
    process.env.CHESSCOM_RETRY_MAX_ATTEMPTS = "2";
    fetchSpy
      .mockResolvedValueOnce(createJsonResponse(200, { archives: ["https://api.chess.com/pub/player/test/games/2025/01"] }))
      .mockResolvedValueOnce(createJsonResponse(429, { games: [] }))
      .mockResolvedValueOnce(createJsonResponse(429, { games: [] }));

    await expect(chessComProvider.importGames({ username: "test-user", max: 20 })).rejects.toThrow(
      "Chess.com monthly archive fetch failed: 429"
    );

    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });

  it("waits between monthly archive requests", async () => {
    process.env.CHESSCOM_RETRY_MAX_ATTEMPTS = "1";
    process.env.CHESSCOM_ARCHIVE_REQUEST_DELAY_MS = "7";
    const timeoutSpy = jest.spyOn(global, "setTimeout");
    fetchSpy
      .mockResolvedValueOnce(createJsonResponse(200, {
        archives: [
          "https://api.chess.com/pub/player/test/games/2025/01",
          "https://api.chess.com/pub/player/test/games/2025/02",
        ],
      }))
      .mockResolvedValueOnce(createJsonResponse(200, { games: [{ uuid: "g-1", pgn: VALID_PGN }] }))
      .mockResolvedValueOnce(createJsonResponse(200, { games: [{ uuid: "g-2", pgn: VALID_PGN }] }));

    await chessComProvider.importGames({ username: "test-user", max: 20 });

    expect(timeoutSpy).toHaveBeenCalledWith(expect.any(Function), 7);
    timeoutSpy.mockRestore();
  });
});
