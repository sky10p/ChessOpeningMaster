import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useParams } from "react-router-dom";
import EditRepertoirePage from "./EditRepertoirePage";
import { useRepertoirePageData } from "../shared/useRepertoirePageData";
import { useNavbarDispatch } from "../../../contexts/NavbarContext";

jest.mock("react-router-dom", () => ({
  useParams: jest.fn(),
}));

jest.mock("../shared/useRepertoirePageData", () => ({
  useRepertoirePageData: jest.fn(),
}));

jest.mock("../../../contexts/NavbarContext", () => ({
  useNavbarDispatch: jest.fn(),
}));

jest.mock("../../../contexts/RepertoireContext", () => ({
  RepertoireContextProvider: ({
    children,
  }: {
    children: React.ReactNode;
  }) => <div data-testid="repertoire-context-provider">{children}</div>,
}));

jest.mock("./EditRepertoireViewContainer", () => () => (
  <div data-testid="edit-view-container">Edit view</div>
));

const mockedUseParams = useParams as jest.Mock;
const mockedUseRepertoirePageData = useRepertoirePageData as jest.Mock;
const mockedUseNavbarDispatch = useNavbarDispatch as jest.Mock;
const mockSetOpen = jest.fn();
const mockRefetch = jest.fn(async () => undefined);

describe("EditRepertoirePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseParams.mockReturnValue({ id: "rep-1" });
    mockedUseNavbarDispatch.mockReturnValue({ setOpen: mockSetOpen });
  });

  it("renders loading state", () => {
    mockedUseRepertoirePageData.mockReturnValue({
      repertoire: undefined,
      loading: true,
      error: null,
      refetch: mockRefetch,
    });

    render(<EditRepertoirePage />);

    expect(screen.getByText("Loading repertoire...")).toBeInTheDocument();
    expect(mockSetOpen).toHaveBeenCalledWith(false);
  });

  it("renders error state", () => {
    mockedUseRepertoirePageData.mockReturnValue({
      repertoire: undefined,
      loading: false,
      error: "Failed to fetch repertoire. Please try again later.",
      refetch: mockRefetch,
    });

    render(<EditRepertoirePage />);

    expect(
      screen.getByText("Failed to fetch repertoire. Please try again later.")
    ).toBeInTheDocument();
  });

  it("renders not found state when repertoire has no id", () => {
    mockedUseRepertoirePageData.mockReturnValue({
      repertoire: undefined,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<EditRepertoirePage />);

    expect(screen.getByText("Repertoire not found")).toBeInTheDocument();
  });

  it("renders edit container when repertoire is loaded", () => {
    mockedUseRepertoirePageData.mockReturnValue({
      repertoire: {
        _id: "rep-1",
        name: "Sicilian Defense",
        moveNodes: {
          id: "root",
          move: null,
          children: [],
        },
        orientation: "white",
        order: 1,
      },
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<EditRepertoirePage />);

    expect(screen.getByTestId("repertoire-context-provider")).toBeInTheDocument();
    expect(screen.getByTestId("edit-view-container")).toBeInTheDocument();
  });
});
