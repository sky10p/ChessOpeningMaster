import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import EditRepertoireViewContainer from "./EditRepertoireViewContainer";
import { getTrainRepertoireRoute } from "../../../utils/appRoutes";

const mockNavigate = jest.fn();
const mockAddIconHeader = jest.fn();
const mockRemoveIconHeader = jest.fn();
const mockAddIconFooter = jest.fn();
const mockRemoveIconFooter = jest.fn();
const mockSetIsVisible = jest.fn();
const mockToggleMenu = jest.fn();
const mockShowAlert = jest.fn();
const mockSaveRepertory = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock("../../../hooks/useIsMobile", () => ({
  useIsMobile: () => true,
}));

jest.mock("../../../contexts/RepertoireContext", () => ({
  useRepertoireContext: () => ({
    repertoireId: "rep-1",
    repertoireName: "Main White",
    saveRepertory: mockSaveRepertory,
    getPgn: jest.fn(),
    chess: { fen: () => "fen" },
    next: jest.fn(),
    nextFollowingVariant: jest.fn(),
    prev: jest.fn(),
    hasNext: () => true,
    hasPrev: () => true,
    selectedVariant: null,
  }),
}));

jest.mock("../../../contexts/HeaderContext", () => ({
  useHeaderDispatch: () => ({
    addIcon: mockAddIconHeader,
    removeIcon: mockRemoveIconHeader,
  }),
}));

jest.mock("../../../contexts/MenuContext", () => ({
  useMenuContext: () => ({
    toggleMenu: mockToggleMenu,
  }),
}));

jest.mock("../../../contexts/FooterContext", () => ({
  useFooterDispatch: () => ({
    addIcon: mockAddIconFooter,
    removeIcon: mockRemoveIconFooter,
    setIsVisible: mockSetIsVisible,
  }),
}));

jest.mock("../../../contexts/AlertContext", () => ({
  useAlertContext: () => ({
    showAlert: mockShowAlert,
  }),
}));

jest.mock("../../../hooks/useRepertoireMastery", () => ({
  useRepertoireMastery: () => 63,
}));

jest.mock("../../../components/application/chess/board/BoardContainer", () => () => (
  <div data-testid="board">Board</div>
));

jest.mock("../../../components/application/chess/board/BoardActionsContainer", () => () => (
  <div data-testid="board-actions">Board actions</div>
));

jest.mock("../../../components/application/chess/board/BoardCommentContainer", () => ({
  BoardCommentContainer: () => <div data-testid="comments-panel">Comments</div>,
}));

jest.mock("../../../components/application/chess/board/VariantsInfo", () => ({
  __esModule: true,
  default: ({ mobileEditorMode }: { mobileEditorMode?: boolean }) => (
    <div data-testid="variants-panel">Variants mobile:{String(mobileEditorMode)}</div>
  ),
}));

jest.mock("../../../components/design/statistics/StatisticsPanel", () => () => (
  <div data-testid="statistics-panel">Statistics</div>
));

jest.mock("../../../components/design/stockfish/StockfishPanel", () => ({
  StockfishPanel: () => <div data-testid="stockfish-panel">Stockfish</div>,
}));

jest.mock("../../../components/application/chess/board/RepertoireInfo", () => ({
  RepertoireInfo: () => <div data-testid="desktop-panel">Desktop panel</div>,
}));

jest.mock("../shared/RepertoireWorkspaceLayout", () => ({
  RepertoireWorkspaceLayout: ({
    title,
    mobileActionRow,
    board,
    boardActions,
    mobilePanel,
  }: {
    title: string;
    mobileActionRow?: React.ReactNode;
    board: React.ReactNode;
    boardActions?: React.ReactNode;
    mobilePanel: React.ReactNode;
  }) => (
    <div>
      <div>{title}</div>
      <div data-testid="mobile-action-row">{mobileActionRow}</div>
      <div data-testid="board-slot">{board}</div>
      <div data-testid="board-actions-slot">{boardActions}</div>
      <div data-testid="mobile-panel-slot">{mobilePanel}</div>
    </div>
  ),
}));

describe("EditRepertoireViewContainer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders mobile editor actions inside the workspace and keeps variants as the active mobile panel", () => {
    render(<EditRepertoireViewContainer />);

    expect(screen.getByRole("button", { name: "Train" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export" })).toBeInTheDocument();
    expect(screen.getByTestId("board")).toBeInTheDocument();
    expect(screen.getByTestId("board-actions")).toBeInTheDocument();
    expect(screen.getByText("Variants mobile:true")).toBeInTheDocument();
    expect(mockAddIconHeader).not.toHaveBeenCalled();
  });

  it("routes train and save actions from the workspace action row", () => {
    render(<EditRepertoireViewContainer />);

    fireEvent.click(screen.getByRole("button", { name: "Train" }));
    expect(mockNavigate).toHaveBeenCalledWith(getTrainRepertoireRoute("rep-1"));

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(mockSaveRepertory).toHaveBeenCalled();
  });
});
