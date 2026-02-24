import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import TrainRepertoireViewContainer from "./TrainRepertoireViewContainer";
import { useTrainRepertoireContext } from "../../../contexts/TrainRepertoireContext";
import { useRepertoireContext } from "../../../contexts/RepertoireContext";

const mockNavigate = jest.fn();
const mockLocation = { search: "" };

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}));

jest.mock("../../../contexts/RepertoireContext", () => ({
  useRepertoireContext: jest.fn(),
}));

jest.mock("../../../contexts/TrainRepertoireContext", () => ({
  useTrainRepertoireContext: jest.fn(),
}));

jest.mock("../../../contexts/HeaderContext", () => ({
  useHeaderDispatch: () => ({
    addIcon: jest.fn(),
    removeIcon: jest.fn(),
  }),
}));

jest.mock("../../../contexts/FooterContext", () => ({
  useFooterDispatch: () => ({
    addIcon: jest.fn(),
    removeIcon: jest.fn(),
    setIsVisible: jest.fn(),
  }),
}));

jest.mock("../../../contexts/DialogContext", () => ({
  useDialogContext: () => ({
    showTrainVariantsDialog: jest.fn(),
    showNumberDialog: jest.fn(),
  }),
}));

jest.mock("../../../contexts/AlertContext", () => ({
  useAlertContext: () => ({
    showAlert: jest.fn(),
  }),
}));

jest.mock("../../../utils/chess/spacedRepetition/spacedRepetition", () => ({
  getSpacedRepetitionVariants: jest.fn(async () => []),
}));

jest.mock("./components/TrainRepertoireStandardWorkspace", () => ({
  TrainRepertoireStandardWorkspace: ({
    finishedTrain,
  }: {
    finishedTrain: boolean;
  }) => (
    <div data-testid="standard-workspace">
      {finishedTrain ? "finished" : "in-progress"}
    </div>
  ),
}));

jest.mock("./components/TrainRepertoireFocusWorkspace", () => ({
  TrainRepertoireFocusWorkspace: ({
    pendingErrorCount,
    hasAssistContent,
    finishedTrain,
    onBack,
  }: {
    pendingErrorCount: number;
    hasAssistContent: boolean;
    finishedTrain: boolean;
    onBack?: () => void;
  }) => (
    <div data-testid="focus-workspace">
      {finishedTrain ? "finished" : "in-progress"}|errors:{pendingErrorCount}|assist:
      {hasAssistContent ? "on" : "off"}
      {onBack ? (
        <button onClick={onBack} type="button">
          focus-back
        </button>
      ) : null}
    </div>
  ),
}));

jest.mock("./components/VariantResultsModal", () => ({
  VariantResultsModal: ({
    open,
    onFixMistakes,
  }: {
    open: boolean;
    onFixMistakes: () => void;
  }) =>
    open ? (
      <button onClick={onFixMistakes} type="button">
        fix-mistakes
      </button>
    ) : null,
}));

jest.mock("./components/MistakeReinforcementPanel", () => ({
  MistakeReinforcementPanel: () => null,
}));

jest.mock("./components/MistakeRatingSheet", () => ({
  MistakeRatingSheet: () => null,
}));

jest.mock("./components/FullRunConfirmPanel", () => ({
  FullRunConfirmPanel: () => null,
}));

jest.mock("./components/FocusModeMoveProgress", () => ({
  FocusModeMoveProgress: () => <div data-testid="focus-progress" />,
}));

jest.mock("../../../components/application/chess/board/BoardContainer", () => ({
  __esModule: true,
  default: () => <div data-testid="board" />,
}));

const mockedUseTrainRepertoireContext = useTrainRepertoireContext as jest.Mock;
const mockedUseRepertoireContext = useRepertoireContext as jest.Mock;

const basePendingReview = {
  variantName: "Spanish: Main Line",
  openingName: "Spanish",
  startingFen: "fen-start",
  wrongMoves: 2,
  ignoredWrongMoves: 0,
  hintsUsed: 0,
  timeSpentSec: 40,
  suggestedRating: "hard" as const,
  mistakes: [
    {
      mistakeKey: "Spanish: Main Line::3::g1f3::0",
      mistakePly: 3,
      variantStartPly: 0,
      positionFen: "fen-2",
      expectedMoveLan: "g1f3",
      expectedMoveSan: "Nf3",
      actualMoveLan: "d2d4",
    },
  ],
  reinforcementMistakes: [
    {
      mistakeKey: "Spanish: Main Line::3::g1f3::0",
      mistakePly: 3,
      variantStartPly: 0,
      positionFen: "fen-2",
      expectedMoveLan: "g1f3",
      expectedMoveSan: "Nf3",
      actualMoveLan: "d2d4",
    },
  ],
  masteryBefore: 20,
  projectedMasteryAfter: 28,
  perfectRunStreakBefore: 0,
  focusCycleStage: "initial" as const,
};

const buildTrainContext = (overrides: Record<string, unknown> = {}) => ({
  trainVariants: [],
  chooseTrainVariantsToTrain: jest.fn(),
  allowedMoves: [],
  isYourTurn: true,
  turn: "white",
  finishedTrain: false,
  lastTrainVariant: undefined,
  pendingVariantReview: null,
  submitPendingVariantReview: jest.fn(async () => ({})),
  markHintUsed: jest.fn(),
  mode: "standard",
  trainingPhase: "standard",
  reinforcementSession: null,
  startMistakeReinforcement: jest.fn(),
  startPendingReviewReinforcement: jest.fn(),
  submitCurrentMistakeRating: jest.fn(async () => null),
  isSavingMistakeRating: false,
  focusModeProgress: null,
  fullRunConfirmState: null,
  finishFullRunConfirm: jest.fn(),
  ...overrides,
});

describe("TrainRepertoireViewContainer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation.search = "";
    mockedUseRepertoireContext.mockReturnValue({
      repertoireId: "rep-1",
      repertoireName: "Principal",
      currentMoveNode: { position: 0, move: null },
      orientation: "white",
      variants: [],
      updateComment: jest.fn(),
    });
  });

  it("starts deferred focus reinforcement without early submit in mistakes mode", async () => {
    const submitPendingVariantReview = jest.fn(async () => ({}));
    const startMistakeReinforcement = jest.fn();
    const startPendingReviewReinforcement = jest.fn();

    mockedUseTrainRepertoireContext.mockReturnValue(
      buildTrainContext({
        mode: "mistakes",
        trainingPhase: "reinforcement",
        pendingVariantReview: basePendingReview,
        submitPendingVariantReview,
        startMistakeReinforcement,
        startPendingReviewReinforcement,
      })
    );

    render(<TrainRepertoireViewContainer />);

    fireEvent.click(screen.getByRole("button", { name: "fix-mistakes" }));

    await waitFor(() => {
      expect(startPendingReviewReinforcement).toHaveBeenCalledWith(
        basePendingReview
      );
    });
    expect(submitPendingVariantReview).not.toHaveBeenCalled();
    expect(startMistakeReinforcement).not.toHaveBeenCalled();
  });

  it("renders focus workspace in mistakes mode with inline assist enabled when errors exist", () => {
    mockedUseTrainRepertoireContext.mockReturnValue(
      buildTrainContext({
        mode: "mistakes",
        trainingPhase: "standard",
        finishedTrain: true,
        focusModeProgress: {
          statuses: ["success", "failed", "pending"],
          activeIndex: 1,
          mistakeKey: "focus::main",
        },
      })
    );

    render(<TrainRepertoireViewContainer />);

    expect(screen.getByTestId("focus-workspace")).toHaveTextContent(
      "finished|errors:1|assist:on"
    );
    expect(screen.queryByTestId("standard-workspace")).not.toBeInTheDocument();
  });

  it("keeps focus assist inactive when there are no errors", () => {
    mockedUseTrainRepertoireContext.mockReturnValue(
      buildTrainContext({
        mode: "mistakes",
        trainingPhase: "standard",
        focusModeProgress: {
          statuses: ["pending", "pending"],
          activeIndex: 0,
          mistakeKey: "focus::main",
        },
      })
    );

    render(<TrainRepertoireViewContainer />);

    expect(screen.getByTestId("focus-workspace")).toHaveTextContent(
      "in-progress|errors:0|assist:off"
    );
  });

  it("renders standard workspace in normal mode", () => {
    mockedUseTrainRepertoireContext.mockReturnValue(buildTrainContext());

    render(<TrainRepertoireViewContainer />);

    expect(screen.getByTestId("standard-workspace")).toHaveTextContent(
      "in-progress"
    );
    expect(screen.queryByTestId("focus-workspace")).not.toBeInTheDocument();
  });

  it("navigates back to opening page from focus mode", () => {
    mockLocation.search = "?mode=mistakes&openingName=Spanish%20Opening";
    mockedUseTrainRepertoireContext.mockReturnValue(
      buildTrainContext({
        mode: "mistakes",
      })
    );

    render(<TrainRepertoireViewContainer />);

    fireEvent.click(screen.getByRole("button", { name: "focus-back" }));

    expect(mockNavigate).toHaveBeenCalledWith(
      "/train/repertoire/rep-1/opening/Spanish%20Opening"
    );
  });

  it("falls back to history back when openingName is not present", () => {
    mockLocation.search = "?mode=mistakes";
    mockedUseTrainRepertoireContext.mockReturnValue(
      buildTrainContext({
        mode: "mistakes",
      })
    );

    render(<TrainRepertoireViewContainer />);

    fireEvent.click(screen.getByRole("button", { name: "focus-back" }));

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
