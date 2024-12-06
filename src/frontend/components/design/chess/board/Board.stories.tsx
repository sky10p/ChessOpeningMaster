import { Story } from "@ladle/react";
import Board from "./Board";
import React from "react";
import { Chess, Move, Square } from "chess.js";
import { MoveVariantNode } from "../../../../models/VariantNode";
import { BoardOrientation } from "../../../../../common/types/Orientation";

export const BoardResponsive: Story = () => {
  const chess = new Chess();
  const orientation: BoardOrientation = "white";
  const squareStyles = {};
  const dragOverSquare = null;
  const pieceMoved = false;
  const selectedSquare = null;
  const possibleMoves: Move[] = [];
  const circleSquares = new Set<Square>();

  const handleSquareClick = (square: Square) => {
    // ...handle square click logic...
  };

  const handleSquareRightClick = (square: Square) => {
    // ...handle square right click logic...
  };

  const onDrop = ({ sourceSquare, targetSquare }: { sourceSquare: Square; targetSquare: Square }) => {
    // ...handle piece drop logic...
    return true;
  };

  return (
    <div style={{ width: "30px"}}>
      <Board
        chess={chess}
        setChess={(newChess) => console.log(newChess)}
        currentMoveNode={new MoveVariantNode()}
        orientation={orientation}
        squareStyles={squareStyles}
        setSquareStyles={(styles) => console.log(styles)}
        dragOverSquare={dragOverSquare}
        setDragOverSquare={(square) => console.log(square)}
        pieceMoved={pieceMoved}
        setPieceMoved={(moved) => console.log(moved)}
        handleSquareClick={handleSquareClick}
        handleSquareRightClick={handleSquareRightClick}
        selectedSquare={selectedSquare}
        setSelectedSquare={(square) => console.log(square)}
        possibleMoves={possibleMoves}
        setPossibleMoves={(moves) => console.log(moves)}
        circleSquares={circleSquares}
        setCircleSquares={(squares) => console.log(squares)}
        onDrop={onDrop}
      />
    </div>
  );
};