import React, { useState, useEffect } from "react";
import { MoveVariantNode } from "../../../../models/VariantNode";
import { TextDialog } from "../../dialogs/TextDialog";
import { ConfirmDialog } from "../../dialogs/ConfirmDialog";

interface VariantMovementsSubpanelProps {
  moves: MoveVariantNode[];
  currentMoveNode: MoveVariantNode;
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
    className={`inline-block p-1.5 cursor-pointer rounded-md transition-all duration-150 ${
      move === currentMoveNode
        ? "bg-blue-600 text-white shadow-md"
        : "hover:bg-slate-700 hover:shadow"
    }`}
    onContextMenu={(event) => onContextMenu(event, move)}
    onClick={onClick}
  >
    <span className={`mr-1 ${move.getMove().color === 'w' ? 'text-white' : 'text-gray-400'}`}>
      {pieceIcons[move.getMove().piece] || ""}
    </span>
    <span className="font-medium">{move.getMove().san}</span>
    {move.variantName && <span className="ml-1 text-yellow-400">📖</span>}
  </span>
);

export const VariantMovementsSubpanel: React.FC<VariantMovementsSubpanelProps> = ({
  moves,
  currentMoveNode,
  goToMove,
  deleteMove,
  changeNameMove,
}) => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: MoveVariantNode | null }>({ x: 0, y: 0, node: null });
  const [contextRenameDialog, setContextRenameDialog] = useState<{ open: boolean; node: MoveVariantNode | null }>({ open: false, node: null });
  const [contextDeleteDialog, setContextDeleteDialog] = useState<{ open: boolean; node: MoveVariantNode | null }>({ open: false, node: null });

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

  const handleDeleteDialog = () => {
    setContextDeleteDialog({ open: true, node: contextMenu.node });
    handleCloseContextMenu();
  };

  const handleCloseDeleteDialog = () => {
    setContextDeleteDialog({ open: false, node: null });
  };

  const handleConfirmDeleteNode = () => {
    if (contextDeleteDialog.node !== null) {
      deleteMove(contextDeleteDialog.node);
    }
    handleCloseDeleteDialog();
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
    <div className="overflow-y-auto h-full w-full rounded-md bg-slate-900 text-white shadow-inner">
      {turns.length > 0 ? (
        <div className="p-3 space-y-2">
          {turns.map((turn) => (
            <div key={turn.whiteMove.id} className="grid grid-cols-12 py-1.5 border-b border-slate-800 last:border-0">
              <div className="col-span-1 text-sm font-semibold text-slate-500 flex items-center">{`${turn.turnNumber}.`}</div>
              <div className="col-span-5 cursor-pointer flex items-center" onClick={() => goToMove(turn.whiteMove)}>
                <MoveItem
                  move={turn.whiteMove}
                  currentMoveNode={currentMoveNode}
                  onContextMenu={handleContextMenu}
                  onClick={() => goToMove(turn.whiteMove)}
                />
                {turn.whiteMove.variantName && (
                  <span className="ml-2 text-xs text-slate-400 hidden sm:inline-block truncate max-w-[100px]" title={turn.whiteMove.variantName}>
                    {turn.whiteMove.variantName}
                  </span>
                )}
              </div>
              <div className="col-span-5 cursor-pointer flex items-center" onClick={() => turn.blackMove && goToMove(turn.blackMove)}>
                {turn.blackMove && (
                  <>
                    <MoveItem
                      move={turn.blackMove}
                      currentMoveNode={currentMoveNode}
                      onContextMenu={handleContextMenu}
                      onClick={() => turn.blackMove && goToMove(turn.blackMove)}
                    />
                    {turn.blackMove.variantName && (
                      <span className="ml-2 text-xs text-slate-400 hidden sm:inline-block truncate max-w-[100px]" title={turn.blackMove.variantName}>
                        {turn.blackMove.variantName}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full p-4 text-slate-500">
          <p className="text-center">No movements available for this variant.</p>
        </div>
      )}

      {contextMenu.node && (
        <div
          className="fixed z-10 rounded-md shadow-lg context-menu bg-slate-800 border border-slate-700 overflow-hidden"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onMouseLeave={handleCloseContextMenu}
        >
          <div className="p-2 cursor-pointer context-menu-item hover:bg-red-600 transition-colors flex items-center gap-2"
               onClick={handleDeleteDialog}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </div>
          <div className="p-2 cursor-pointer context-menu-item hover:bg-blue-600 transition-colors flex items-center gap-2"
               onClick={handleRenameDialog}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Rename
          </div>
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
      <ConfirmDialog
        open={contextDeleteDialog.open}
        onClose={handleCloseDeleteDialog}
        title="Delete move"
        contentText="Are you sure you want to delete this move and all following moves in this variant?"
        onConfirm={handleConfirmDeleteNode}
      />
    </div>
  );
};
