import { renderHook, waitFor, act } from "@testing-library/react";
import { useRepertoirePageData } from "./useRepertoirePageData";
import { getRepertoire } from "../../../repository/repertoires/repertoires";
import { IRepertoire } from "@chess-opening-master/common";

jest.mock("../../../repository/repertoires/repertoires", () => ({
  getRepertoire: jest.fn(),
}));

const mockedGetRepertoire = getRepertoire as jest.MockedFunction<
  typeof getRepertoire
>;

const mockRepertoire: IRepertoire = {
  _id: "rep-1",
  name: "Sicilian",
  moveNodes: {
    id: "root",
    move: null,
    children: [],
  },
  orientation: "white",
  order: 1,
};

describe("useRepertoirePageData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads repertoire successfully and updates loading state", async () => {
    mockedGetRepertoire.mockResolvedValue(mockRepertoire);

    const { result } = renderHook(() => useRepertoirePageData("rep-1"));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockedGetRepertoire).toHaveBeenCalledWith("rep-1");
    expect(result.current.repertoire).toEqual(mockRepertoire);
    expect(result.current.error).toBeNull();
  });

  it("sets error when fetch fails and updates loading state", async () => {
    mockedGetRepertoire.mockRejectedValue(new Error("network error"));

    const { result } = renderHook(() => useRepertoirePageData("rep-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.repertoire).toBeUndefined();
    expect(result.current.error).toBe(
      "Failed to fetch repertoire. Please try again later."
    );
  });

  it("does not fetch when repertoire id is missing", async () => {
    const { result } = renderHook(() => useRepertoirePageData(undefined));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockedGetRepertoire).not.toHaveBeenCalled();
    expect(result.current.repertoire).toBeUndefined();
    expect(result.current.error).toBeNull();
  });

  it("refetches repertoire on demand", async () => {
    mockedGetRepertoire.mockResolvedValue(mockRepertoire);

    const { result } = renderHook(() => useRepertoirePageData("rep-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockedGetRepertoire).toHaveBeenCalledTimes(2);
  });
});
