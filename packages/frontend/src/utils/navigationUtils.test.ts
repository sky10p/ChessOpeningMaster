import { renderHook } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import { IRepertoire } from "@chess-opening-master/common";
import { useNavigationUtils } from "./navigationUtils";
import {
  buildTrainExecutionSearch,
  getRepertoireEditorRoute,
  getRepertoireOpeningRoute,
  getTrainRepertoireRoute,
} from "./appRoutes";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

const mockNavigate = jest.fn();

describe("useNavigationUtils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  const mockRepertoire: IRepertoire = {
    _id: "repertoire-123",
    name: "Test Repertoire",
    moveNodes: {
      id: "root",
      move: null,
      children: [],
    },
    orientation: "white",
    order: 1,
  };

  describe("goToRepertoire", () => {
    it("navigates to repertoire with string ID", () => {
      const { result } = renderHook(() => useNavigationUtils());

      result.current.goToRepertoire("test-repertoire-id");

      expect(mockNavigate).toHaveBeenCalledWith("/repertoire/test-repertoire-id");
    });

    it("navigates to repertoire with IRepertoire object", () => {
      const { result } = renderHook(() => useNavigationUtils());

      result.current.goToRepertoire(mockRepertoire);

      expect(mockNavigate).toHaveBeenCalledWith("/repertoire/repertoire-123");
    });

    it("navigates to repertoire with string ID and variant name", () => {
      const { result } = renderHook(() => useNavigationUtils());

      result.current.goToRepertoire("test-repertoire-id", "Italian Game");

      expect(mockNavigate).toHaveBeenCalledWith(
        getRepertoireEditorRoute("test-repertoire-id", { variantName: "Italian Game" })
      );
    });

    it("navigates to repertoire with IRepertoire object and variant name", () => {
      const { result } = renderHook(() => useNavigationUtils());

      result.current.goToRepertoire(mockRepertoire, "Sicilian Defense");

      expect(mockNavigate).toHaveBeenCalledWith(
        getRepertoireEditorRoute("repertoire-123", { variantName: "Sicilian Defense" })
      );
    });

    it("properly encodes special characters in variant name", () => {
      const { result } = renderHook(() => useNavigationUtils());

      result.current.goToRepertoire("test-id", "Queen's Gambit: Declined");

      expect(mockNavigate).toHaveBeenCalledWith(
        getRepertoireEditorRoute("test-id", { variantName: "Queen's Gambit: Declined" })
      );
    });

    it("handles empty variant name by not adding query parameter", () => {
      const { result } = renderHook(() => useNavigationUtils());

      result.current.goToRepertoire("test-id", "");

      expect(mockNavigate).toHaveBeenCalledWith("/repertoire/test-id");
    });
  });

  describe("goToTrainRepertoire", () => {
    it("navigates to train repertoire with string ID", () => {
      const { result } = renderHook(() => useNavigationUtils());

      result.current.goToTrainRepertoire("test-repertoire-id");

      expect(mockNavigate).toHaveBeenCalledWith("/train/repertoires/test-repertoire-id");
    });

    it("navigates to train repertoire with IRepertoire object", () => {
      const { result } = renderHook(() => useNavigationUtils());

      result.current.goToTrainRepertoire(mockRepertoire);

      expect(mockNavigate).toHaveBeenCalledWith("/train/repertoires/repertoire-123");
    });

    it("navigates to train repertoire with string ID and variant name", () => {
      const { result } = renderHook(() => useNavigationUtils());

      result.current.goToTrainRepertoire("test-repertoire-id", "Italian Game");

      expect(mockNavigate).toHaveBeenCalledWith(
        getTrainRepertoireRoute(
          "test-repertoire-id",
          buildTrainExecutionSearch({ variantName: "Italian Game" })
        )
      );
    });

    it("navigates to train repertoire with IRepertoire object and variant name", () => {
      const { result } = renderHook(() => useNavigationUtils());

      result.current.goToTrainRepertoire(mockRepertoire, "Sicilian Defense");

      expect(mockNavigate).toHaveBeenCalledWith(
        getTrainRepertoireRoute(
          "repertoire-123",
          buildTrainExecutionSearch({ variantName: "Sicilian Defense" })
        )
      );
    });

    it("properly encodes special characters in variant name for training", () => {
      const { result } = renderHook(() => useNavigationUtils());

      result.current.goToTrainRepertoire("test-id", "Queen's Gambit: Declined");

      expect(mockNavigate).toHaveBeenCalledWith(
        getTrainRepertoireRoute(
          "test-id",
          buildTrainExecutionSearch({ variantName: "Queen's Gambit: Declined" })
        )
      );
    });
  });

  describe("goToTrainOpening", () => {
    it("navigates to train opening detail route", () => {
      const { result } = renderHook(() => useNavigationUtils());

      result.current.goToTrainOpening("test-repertoire-id", "Italian Game");

      expect(mockNavigate).toHaveBeenCalledWith(
        getRepertoireOpeningRoute("test-repertoire-id", "Italian Game")
      );
    });
  });

  describe("resolveId functionality", () => {
    it("correctly resolves ID from different repertoire objects", () => {
      const { result } = renderHook(() => useNavigationUtils());

      const repertoire1: IRepertoire = {
        _id: "id-1",
        name: "Repertoire 1",
        moveNodes: {
          id: "root",
          move: null,
          children: [],
        },
        orientation: "white",
        order: 1,
      };

      const repertoire2: IRepertoire = {
        _id: "id-2",
        name: "Repertoire 2",
        moveNodes: {
          id: "root",
          move: null,
          children: [],
        },
        orientation: "black",
        order: 2,
      };

      result.current.goToRepertoire(repertoire1);
      result.current.goToRepertoire(repertoire2);

      expect(mockNavigate).toHaveBeenNthCalledWith(1, "/repertoire/id-1");
      expect(mockNavigate).toHaveBeenNthCalledWith(2, "/repertoire/id-2");
    });

    it("handles repertoire objects with disabled property", () => {
      const { result } = renderHook(() => useNavigationUtils());

      const disabledRepertoire: IRepertoire = {
        _id: "disabled-id",
        name: "Disabled Repertoire",
        moveNodes: {
          id: "root",
          move: null,
          children: [],
        },
        orientation: "white",
        order: 1,
        disabled: true,
      };

      result.current.goToRepertoire(disabledRepertoire);

      expect(mockNavigate).toHaveBeenCalledWith("/repertoire/disabled-id");
    });
  });

  describe("URL building edge cases", () => {
    it("handles variant names with spaces and special characters", () => {
      const { result } = renderHook(() => useNavigationUtils());
      const specialVariantName = "King's Indian: Four Pawns Attack & Other Lines";

      result.current.goToRepertoire("test-id", specialVariantName);

      expect(mockNavigate).toHaveBeenCalledWith(
        getRepertoireEditorRoute("test-id", { variantName: specialVariantName })
      );
    });

    it("handles variant names with Unicode characters", () => {
      const { result } = renderHook(() => useNavigationUtils());
      const unicodeVariantName = "Réti Opening: Advance Variation";

      result.current.goToRepertoire("test-id", unicodeVariantName);

      expect(mockNavigate).toHaveBeenCalledWith(
        getRepertoireEditorRoute("test-id", { variantName: unicodeVariantName })
      );
    });

    it("handles extremely long variant names", () => {
      const { result } = renderHook(() => useNavigationUtils());
      const longVariantName =
        "Sicilian Defense: Accelerated Dragon, Maróczy Bind, Breyer Variation with Long Descriptive Name";

      result.current.goToRepertoire("test-id", longVariantName);

      expect(mockNavigate).toHaveBeenCalledWith(
        getRepertoireEditorRoute("test-id", { variantName: longVariantName })
      );
    });
  });
});
