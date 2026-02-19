import { act, renderHook } from "@testing-library/react";
import { useGamesFilters } from "../hooks/useGamesFilters";

describe("useGamesFilters", () => {
  it("applies and resets filter state", () => {
    const { result } = renderHook(() => useGamesFilters());

    act(() => {
      result.current.setFiltersDraft((prev) => ({
        ...prev,
        source: "lichess",
        openingQuery: "Sicilian",
      }));
    });

    act(() => {
      result.current.applyFilters();
    });

    expect(result.current.filtersApplied.source).toBe("lichess");
    expect(result.current.filtersApplied.openingQuery).toBe("Sicilian");
    expect(result.current.activeFiltersCount).toBe(2);

    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.filtersApplied.source).toBe("all");
    expect(result.current.filtersApplied.openingQuery).toBe("");
    expect(result.current.activeFiltersCount).toBe(0);
  });

  it("applies filters from mobile and closes drawer", () => {
    const { result } = renderHook(() => useGamesFilters());

    act(() => {
      result.current.setShowMobileFilters(true);
      result.current.setFiltersDraft((prev) => ({ ...prev, mapped: "mapped" }));
    });

    act(() => {
      result.current.applyFiltersMobile();
    });

    expect(result.current.showMobileFilters).toBe(false);
    expect(result.current.filtersApplied.mapped).toBe("mapped");
  });
});
