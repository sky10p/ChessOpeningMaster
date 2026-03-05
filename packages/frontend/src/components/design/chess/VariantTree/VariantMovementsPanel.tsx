import React, { useState, useEffect } from "react";
import { MoveVariantNode } from "../../../../models/VariantNode";
import { TextDialog } from "../../dialogs/TextDialog";
import { ConfirmDialog } from "../../dialogs/ConfirmDialog";
import { Tooltip } from "../../../ui";

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
    className={`inline-block cursor-pointer rounded-md px-2 py-1.5 transition-colors ${
      move === currentMoveNode ? "bg-brand text-text-on-brand shadow-surface" : "hover:bg-interactive"
    }`}
    onContextMenu={(event) => onContextMenu(event, move)}
    onClick={onClick}
  >
    <span className={`mr-1 ${move.getMove().color === "w" ? "text-text-base" : "text-text-muted"}`}>
      {pieceIcons[move.getMove().piece] || ""}
    </span>
    <span>{move.getMove().san}</span>
    {move.variantName && <span className="ml-1">📖</span>}
  </span>
);

const VariantReference: React.FC<{ name: string }> = ({ name }) => (
  <>
    <div className="mt-1 max-w-full sm:hidden">
      <span className="block text-[11px] leading-snug text-text-subtle">{name}</span>
    </div>
    <Tooltip content={name} className="hidden sm:block">
      <span className="mt-1 block text-xs leading-snug text-text-subtle">{name}</span>
    </Tooltip>
  </>
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
    <div className="overflow-y-auto rounded-xl border border-border-default bg-surface-raised p-3 text-text-base" style={maxHeight ? { maxHeight } : undefined}>
      {turns.map((turn, index) => (
        <div key={index} className="grid grid-cols-12 border-b border-border-subtle py-2 last:border-b-0">
          <div className="col-span-1 text-sm font-semibold text-text-subtle">{`${turn.turnNumber}.`}</div>
          <div className="col-span-5 cursor-pointer" onClick={() => goToMove(turn.whiteMove)}>
            <MoveItem move={turn.whiteMove} currentMoveNode={currentMoveNode} onContextMenu={handleContextMenu} onClick={() => goToMove(turn.whiteMove)} />
            {turn.whiteMove.variantName && <VariantReference name={turn.whiteMove.variantName} />}
          </div>
          <div className="col-span-5 cursor-pointer" onClick={() => turn.blackMove && goToMove(turn.blackMove)}>
            {turn.blackMove && (
              <>
                <MoveItem move={turn.blackMove} currentMoveNode={currentMoveNode} onContextMenu={handleContextMenu} onClick={() => turn.blackMove && goToMove(turn.blackMove)} />
                {turn.blackMove.variantName && <VariantReference name={turn.blackMove.variantName} />}
              </>
            )}
          </div>
        </div>
      ))}
      {contextMenu.node && (
        <div
          className="context-menu fixed z-10 overflow-hidden rounded-md border border-border-default bg-surface shadow-elevated"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onMouseLeave={handleCloseContextMenu}
        >
          <div className="cursor-pointer p-2 text-sm transition-colors hover:bg-danger hover:text-text-on-brand" onClick={handleDeleteDialog}>Delete</div>
          <div className="cursor-pointer p-2 text-sm transition-colors hover:bg-interactive" onClick={handleRenameDialog}>Rename</div>
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
