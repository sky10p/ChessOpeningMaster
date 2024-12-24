import React from "react";
import { MoveVariantNode } from "../../../../models/VariantNode";

interface MoveButtonProps {
  move: MoveVariantNode;
  isSelectedMove: boolean;
  onContextMenu: (event: React.MouseEvent, move: MoveVariantNode) => void;
  onClick: (move: MoveVariantNode) => void;
  isWhiteMove: boolean;
}

export const MoveButton: React.FC<MoveButtonProps & { isWhiteMove: boolean }> = ({
  move,
  isSelectedMove,
  onContextMenu,
  onClick,
  isWhiteMove,
}) => {
  return (
    <div title={move.variantName || ''} className="relative">
      <button
        onContextMenu={(event) => onContextMenu(event, move)}
        onClick={() => onClick(move)}
        className={`min-w-[40px] min-h-[30px] m-0.5 p-0.5 px-1 text-sm font-normal 
          ${isWhiteMove ? 'bg-white text-black' : 'bg-gray-800 text-white'}
          ${isSelectedMove ? 'bg-blue-600 text-white border-blue-600' : ''}
          hover:bg-blue-700 hover:border-blue-700 hover:text-white focus:outline-none`}
      >
        <div className="flex items-center justify-between h-7 w-16">
          {move.getMove().san}
          {move.variantName && (
            <div className="flex items-center">
              📖
            </div>
          )}
        </div>
      </button>
    </div>
  );
};
