import React from "react";
import { useBoardContainer } from "./useBoardContainer";
import Board from "../../../design/chess/board/Board";
import { MoveErrorDialog } from "../../../design/dialogs/MoveErrorDialog";

interface BoardContainerProps {
  isTraining?: boolean;
}

const BoardContainer: React.FC<BoardContainerProps> = ({ isTraining = false }) => {
  const {
    chess,
    setChess,
    currentMoveNode,
    orientation,
    handleSquareClick,
    handleSquareRightClick,
    selectedSquare,
    setSelectedSquare,
    onDrop,
    squareStyles,
    setSquareStyles,
    dragOverSquare,
    setDragOverSquare,
    pieceMoved,
    setPieceMoved,
    circleSquares,
    setCircleSquares,
    possibleMoves,
    setPossibleMoves,
    errorDialogOpen,
    handleCountAsError,
    handleIgnoreError,
  } = useBoardContainer(isTraining);

  return (
    <>
      <Board
        chess={chess}
        setChess={setChess}
        currentMoveNode={currentMoveNode}
        orientation={orientation}
        handleSquareClick={handleSquareClick}
        handleSquareRightClick={handleSquareRightClick}
        selectedSquare={selectedSquare}
        setSelectedSquare={setSelectedSquare}
        onDrop={onDrop}
        squareStyles={squareStyles}
        setSquareStyles={setSquareStyles}
        dragOverSquare={dragOverSquare}
        setDragOverSquare={setDragOverSquare}
        pieceMoved={pieceMoved}
        setPieceMoved={setPieceMoved}
        circleSquares={circleSquares}
        setCircleSquares={setCircleSquares}
        possibleMoves={possibleMoves}
        setPossibleMoves={setPossibleMoves}
      />
      <MoveErrorDialog 
        open={errorDialogOpen}
        title="Invalid Move"
        message="The move is not valid according to the repertoire."
        onCountAsError={handleCountAsError}
        onIgnoreError={handleIgnoreError}
      />
    </>
  );
};

export default BoardContainer;
