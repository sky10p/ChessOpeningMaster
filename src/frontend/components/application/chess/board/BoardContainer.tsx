import React from "react";
import { useBoardContainer } from "./useBoardContainer";
import Board from "../../../design/chess/board/Board";

interface BoardContainerProps {
  calcWidth: (dimensions: { screenWidth: number }) => number;
  isTraining?: boolean;
}

const BoardContainer: React.FC<BoardContainerProps> = ({ calcWidth, isTraining = false }) => {
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
  } = useBoardContainer(isTraining);

  return (
    <Board
      chess={chess}
      setChess={setChess}
      currentMoveNode={currentMoveNode}
      orientation={orientation}
      calcWidth={calcWidth}
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
  );
};

export default BoardContainer;
