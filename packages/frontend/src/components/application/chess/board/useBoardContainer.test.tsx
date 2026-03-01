import { act, renderHook } from "@testing-library/react";
import { useBoardContainer } from "./useBoardContainer";

const mockSetChess = jest.fn();
const mockAddMove = jest.fn();
const mockShowAlert = jest.fn();
const mockRegisterWrongMove = jest.fn();
const mockSetLastErrors = jest.fn();
const mockSetLastIgnoredErrors = jest.fn();
const mockMarkReinforcementFailure = jest.fn();
const mockMarkReinforcementSuccess = jest.fn();
const mockMove = jest.fn();

jest.mock("chess.js", () => ({
  Chess: jest.fn().mockImplementation(() => ({
    fen: jest.fn(() => "k7/4P3/8/8/8/8/8/4K3 w - - 0 1"),
    move: mockMove,
    turn: jest.fn(() => "w"),
    moves: jest.fn(() => []),
  })),
}));

jest.mock("../../../../contexts/RepertoireContext", () => ({
  useRepertoireContext: jest.fn(),
}));

jest.mock("../../../../contexts/TrainRepertoireContext", () => ({
  useTrainRepertoireContext: jest.fn(),
}));

jest.mock("../../../../contexts/AlertContext", () => ({
  useAlertContext: jest.fn(),
}));

const { useRepertoireContext } = jest.requireMock("../../../../contexts/RepertoireContext") as {
  useRepertoireContext: jest.Mock;
};
const { useTrainRepertoireContext } = jest.requireMock("../../../../contexts/TrainRepertoireContext") as {
  useTrainRepertoireContext: jest.Mock;
};
const { useAlertContext } = jest.requireMock("../../../../contexts/AlertContext") as {
  useAlertContext: jest.Mock;
};

describe("useBoardContainer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMove.mockReturnValue({
      from: "e7",
      to: "e8",
      san: "e8=Q+",
      promotion: "q",
    });
    useRepertoireContext.mockReturnValue({
      chess: {
        fen: () => "k7/4P3/8/8/8/8/8/4K3 w - - 0 1",
      },
      setChess: mockSetChess,
      addMove: mockAddMove,
      orientation: "white",
      currentMoveNode: { circles: [] },
    });
    useTrainRepertoireContext.mockReturnValue({
      allowedMoves: [],
      trainingPhase: "standard",
      registerWrongMove: mockRegisterWrongMove,
      lastErrors: 0,
      setLastErrors: mockSetLastErrors,
      lastIgnoredErrors: 0,
      setLastIgnoredErrors: mockSetLastIgnoredErrors,
      markReinforcementFailure: mockMarkReinforcementFailure,
      markReinforcementSuccess: mockMarkReinforcementSuccess,
    });
    useAlertContext.mockReturnValue({
      showAlert: mockShowAlert,
    });
  });

  it("records promotion mistakes with full LAN", () => {
    const { result } = renderHook(() => useBoardContainer(true));

    act(() => {
      result.current.onDrop({
        sourceSquare: "e7",
        targetSquare: "e8",
      });
    });

    expect(result.current.errorDialogOpen).toBe(true);

    act(() => {
      result.current.handleCountAsError();
    });

    expect(mockRegisterWrongMove).toHaveBeenCalledWith(
      "e7e8q",
      "k7/4P3/8/8/8/8/8/4K3 w - - 0 1"
    );
    expect(mockSetChess).not.toHaveBeenCalled();
    expect(mockAddMove).not.toHaveBeenCalled();
  });
});
