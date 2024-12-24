import React, { useState, useEffect } from "react";
import { MoveVariantNode } from "../../../../models/VariantNode";
import { TextDialog } from "../../dialogs/TextDialog";

interface VariantMovementsPanelProps {
  moves: MoveVariantNode[];
  currentMoveNode: MoveVariantNode;
  maxHeight?: string;
  goToMove: (move: MoveVariantNode) => void;
  deleteMove: (move: MoveVariantNode) => void;
  changeNameMove: (move: MoveVariantNode, newName: string) => void;
}

const pieceIcons: { [key: string]: string } = {
  P: "♙",
  N: "♘",
  B: "♗",
  R: "♖",
  Q: "♕",
  K: "♔",
  p: "♟",
  n: "♞",
  b: "♝",
  r: "♜",
  q: "♛",
  k: "♚",
};

const MoveItem: React.FC<{
  move: MoveVariantNode;
  currentMoveNode: MoveVariantNode;
  onContextMenu: (event: React.MouseEvent, node: MoveVariantNode) => void;
  onClick: () => void;
}> = ({ move, currentMoveNode, onContextMenu, onClick }) => (
  <span
    className={`inline-block p-1 cursor-pointer rounded ${
      move === currentMoveNode ? "bg-primary text-textLight" : "hover:bg-gray-700"
    }`}
    onContextMenu={(event) => onContextMenu(event, move)}
    onClick={onClick}
  >
    <span className={`mr-1 ${move.getMove().color === 'w' ? 'text-white' : 'text-black'}`}>
      {pieceIcons[move.getMove().piece] || ""}
    </span>
    <span>{move.getMove().san}</span>
    {move.variantName && <span className="ml-1">📖</span>}
  </span>
);

export const VariantMovementsPanel: React.FC<VariantMovementsPanelProps> = ({
  moves,
  currentMoveNode,
  maxHeight = "25rem",
  goToMove,
  deleteMove,
  changeNameMove,
}) => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: MoveVariantNode | null }>({ x: 0, y: 0, node: null });
  const [contextRenameDialog, setContextRenameDialog] = useState<{ open: boolean; node: MoveVariantNode | null }>({ open: false, node: null });

  const handleContextMenu = (event: React.MouseEvent, node: MoveVariantNode) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, node });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({ x: 0, y: 0, node: null });
  };

  const handleRenameDialog = () => {
    setContextRenameDialog({ ...contextRenameDialog, node: contextMenu.node, open: true });
    handleCloseContextMenu();
  };

  const handleCloseRenameDialog = () => {
    setContextRenameDialog({ open: false, node: null });
  };

  const handleRenameNode = (newName: string) => {
    if (contextRenameDialog.node !== null) {
      changeNameMove(contextRenameDialog.node, newName);
    }
    handleCloseRenameDialog();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenu.node && !(event.target as HTMLElement).closest('.context-menu')) {
        handleCloseContextMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenu]);

  const turns = moves.reduce<{ turnNumber: number; whiteMove: MoveVariantNode; blackMove: MoveVariantNode | null }[]>(
    (acc, move, index) => {
      if (index % 2 === 0) {
        acc.push({
          turnNumber: Math.floor(index / 2) + 1,
          whiteMove: move,
          blackMove: moves[index + 1] || null,
        });
      }
      return acc;
    },
    []
  );

  return (
    <div className={`max-h-${maxHeight} overflow-y-auto p-4 bg-gray-80 text-textLight`}>
      {turns.map((turn, index) => (
        <div key={index} className="grid grid-cols-12 py-2">
          <div className="col-span-1 text-sm">{`${turn.turnNumber}.`}</div>
          <div className="col-span-5 cursor-pointer" onClick={() => goToMove(turn.whiteMove)}>
            <MoveItem move={turn.whiteMove} currentMoveNode={currentMoveNode} onContextMenu={handleContextMenu} onClick={() => goToMove(turn.whiteMove)} />
            {turn.whiteMove.variantName && <span className="ml-2 hidden sm:text-sm">{turn.whiteMove.variantName}</span>}
          </div>
          <div className="col-span-5 cursor-pointer" onClick={() => turn.blackMove && goToMove(turn.blackMove)}>
            {turn.blackMove && (
              <>
                <MoveItem move={turn.blackMove} currentMoveNode={currentMoveNode} onContextMenu={handleContextMenu} onClick={() => turn.blackMove && goToMove(turn.blackMove)} />
                {turn.blackMove.variantName && <span className="ml-2 hidden sm:text-sm">{turn.blackMove.variantName}</span>}
              </>
            )}
          </div>
        </div>
      ))}
      {contextMenu.node && (
        <div
          className="fixed z-10 bg-white border text-black border-gray-300 rounded shadow-lg context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onMouseLeave={handleCloseContextMenu}
        >
          <div className="p-2 cursor-pointer hover:bg-gray-200" onClick={() => { if (contextMenu.node) { deleteMove(contextMenu.node); } handleCloseContextMenu(); }}>Delete</div>
          <div className="p-2 cursor-pointer hover:bg-gray-200" onClick={handleRenameDialog}>Rename</div>
        </div>
      )}
      <TextDialog
        open={contextRenameDialog.open}
        initialValue={contextRenameDialog.node?.variantName || ""}
        onClose={handleCloseRenameDialog}
        title="Rename Move"
        contentText="Please enter the new name for the move:"
        onTextConfirm={handleRenameNode}
      />
    </div>
  );
};