import { renderHook, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { useGamesData } from "../hooks/useGamesData";
import * as gamesRepo from "../../../repository/games/games";

jest.mock("../../../repository/games/games");

const mockedGetLinkedAccounts = gamesRepo.getLinkedAccounts as jest.MockedFunction<typeof gamesRepo.getLinkedAccounts>;
const mockedGetImportedGames = gamesRepo.getImportedGames as jest.MockedFunction<typeof gamesRepo.getImportedGames>;
const mockedGetGamesStats = gamesRepo.getGamesStats as jest.MockedFunction<typeof gamesRepo.getGamesStats>;
const mockedGetTrainingPlan = gamesRepo.getTrainingPlan as jest.MockedFunction<typeof gamesRepo.getTrainingPlan>;
const mockedSaveLinkedAccount = gamesRepo.saveLinkedAccount as jest.MockedFunction<typeof gamesRepo.saveLinkedAccount>;
const mockedSetTrainingPlanItemDone = gamesRepo.setTrainingPlanItemDone as jest.MockedFunction<typeof gamesRepo.setTrainingPlanItemDone>;

const flushAsyncState = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

describe("useGamesData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetLinkedAccounts.mockResolvedValue([]);
    mockedGetImportedGames.mockResolvedValue([]);
    mockedGetGamesStats.mockResolvedValue({
      totalGames: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      winRate: 0,
      bySource: [],
      mappedToRepertoireCount: 0,
      needsManualReviewCount: 0,
      uniqueLines: 0,
      openingPerformance: [],
      variantPerformance: [],
      gamesByMonth: [],
      unmappedOpenings: [],
      unusedRepertoires: [],
      topOpenings: [],
      linesToStudy: [],
    });
    mockedGetTrainingPlan.mockResolvedValue(null);
    mockedSaveLinkedAccount.mockResolvedValue({
      id: "a1",
      provider: "lichess",
      username: "tester",
      connectedAt: new Date().toISOString(),
      status: "idle",
    });
    mockedSetTrainingPlanItemDone.mockResolvedValue();
  });

  it("loads data with the applied query including training plan filter", async () => {
    const query = { source: "lichess" as const, mapped: "mapped" as const };
    const { result } = renderHook(() => useGamesData(query));
    await flushAsyncState();

    await waitFor(() => expect(mockedGetTrainingPlan).toHaveBeenCalledWith(query));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockedGetImportedGames).toHaveBeenCalledWith({ limit: 500, ...query });
    expect(mockedGetGamesStats).toHaveBeenCalledWith(query);
    expect(mockedGetTrainingPlan).toHaveBeenCalledWith(query);
  });

  it("connects account and refreshes data", async () => {
    const query = {};
    const { result } = renderHook(() => useGamesData(query));
    await flushAsyncState();

    await waitFor(() => expect(mockedGetLinkedAccounts).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setProvider("lichess");
      result.current.setUsername("tester");
      result.current.setToken("secret");
    });

    await act(async () => {
      await result.current.connectAccount();
    });
    await flushAsyncState();

    expect(mockedSaveLinkedAccount).toHaveBeenCalledWith("lichess", "tester", "secret");
    await waitFor(() => expect(mockedGetLinkedAccounts).toHaveBeenCalledTimes(2));
    expect(mockedGetImportedGames).toHaveBeenCalledTimes(1);
    expect(mockedGetGamesStats).toHaveBeenCalledTimes(1);
    expect(mockedGetTrainingPlan).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(result.current.message).toBe("Account linked"));
  });

  it("marks training item done and only refreshes training plan", async () => {
    const query = { source: "lichess" as const };
    const { result } = renderHook(() => useGamesData(query));
    await flushAsyncState();

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.markDone("plan-1", "line-1", true);
    });
    await flushAsyncState();

    expect(mockedSetTrainingPlanItemDone).toHaveBeenCalledWith("plan-1", "line-1", true);
    expect(mockedGetTrainingPlan).toHaveBeenCalledTimes(2);
    expect(mockedGetLinkedAccounts).toHaveBeenCalledTimes(1);
    expect(mockedGetImportedGames).toHaveBeenCalledTimes(1);
    expect(mockedGetGamesStats).toHaveBeenCalledTimes(1);
  });
});
