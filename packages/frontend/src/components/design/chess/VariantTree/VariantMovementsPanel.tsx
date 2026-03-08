import React, { useEffect, useState } from "react";
import { MoveVariantNode } from "../../../../models/VariantNode";
import { TextDialog } from "../../dialogs/TextDialog";
import { ConfirmDialog } from "../../dialogs/ConfirmDialog";
import { Button, Tooltip } from "../../../ui";
import { cn } from "../../../../utils/cn";

interface VariantMovementsPanelProps {
  moves: MoveVariantNode[];
  currentMoveNode: MoveVariantNode;
  maxHeight?: string;
  mobileMode?: boolean;
  goToMove: (move: MoveVariantNode) => void;
  deleteMove: (move: MoveVariantNode) => void;
  changeNameMove: (move: MoveVariantNode, newName: string) => void;
}

const pieceIcons: { [key: string]: string } = {
  P: "\u2659",
  N: "\u2658",
  B: "\u2657",
  R: "\u2656",
  Q: "\u2655",
  K: "\u2654",
  p: "\u265F",
  n: "\u265E",
  b: "\u265D",
  r: "\u265C",
  q: "\u265B",
  k: "\u265A",
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
    {move.variantName && <span className="ml-1">{`\u{1F4D6}`}</span>}
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
  mobileMode = false,
  goToMove,
  deleteMove,
  changeNameMove,
}) => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: MoveVariantNode | null }>({
    x: 0,
    y: 0,
    node: null,
  });
  const [contextRenameDialog, setContextRenameDialog] = useState<{ open: boolean; node: MoveVariantNode | null }>({
    open: false,
    node: null,
  });
  const [contextDeleteDialog, setContextDeleteDialog] = useState<{ open: boolean; node: MoveVariantNode | null }>({
    open: false,
    node: null,
  });

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
      if (contextMenu.node && !(event.target as HTMLElement).closest(".context-menu")) {
        handleCloseContextMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
    <div
      className={cn(
        "min-w-0 overflow-x-hidden overflow-y-auto rounded-xl border border-border-default bg-surface-raised text-text-base",
        mobileMode ? "p-2" : "p-3"
      )}
      style={maxHeight ? { maxHeight } : undefined}
    >
      {mobileMode ? (
        <div className="min-w-0 divide-y divide-border-subtle overflow-hidden rounded-lg border border-border-subtle bg-surface">
          {turns.map((turn, index) => (
            <div key={index} className="px-2 py-1.5">
              <div className="grid grid-cols-[1.75rem_minmax(0,1fr)_minmax(0,1fr)] items-center gap-1.5">
                <p className="text-sm font-semibold text-text-subtle">{`${turn.turnNumber}.`}</p>
                <div className="min-w-0">
                  <Button
                    intent={turn.whiteMove === currentMoveNode ? "primary" : "secondary"}
                    size="sm"
                    className="w-full min-w-0 justify-start rounded-md px-2 py-1 text-sm min-h-[32px]"
                    onClick={() => goToMove(turn.whiteMove)}
                    onContextMenu={(event) => handleContextMenu(event, turn.whiteMove)}
                  >
                    <span className="truncate">{turn.whiteMove.getMove().san}</span>
                  </Button>
                </div>
                <div className="min-w-0">
                  {turn.blackMove ? (
                    <Button
                      intent={turn.blackMove === currentMoveNode ? "primary" : "secondary"}
                      size="sm"
                      className="w-full min-w-0 justify-start rounded-md px-2 py-1 text-sm min-h-[32px]"
                      onClick={() => goToMove(turn.blackMove as MoveVariantNode)}
                      onContextMenu={(event) => handleContextMenu(event, turn.blackMove as MoveVariantNode)}
                    >
                      <span className="truncate">{turn.blackMove.getMove().san}</span>
                    </Button>
                  ) : (
                    <div className="h-8 rounded-md border border-dashed border-border-subtle bg-page-subtle" />
                  )}
                </div>
              </div>
              {turn.whiteMove.variantName || turn.blackMove?.variantName ? (
                <div className="mt-1 pl-8">
                  <VariantReference name={turn.whiteMove.variantName || turn.blackMove?.variantName || ""} />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        turns.map((turn, index) => (
          <div key={index} className="grid grid-cols-12 border-b border-border-subtle py-2 last:border-b-0">
            <div className="col-span-1 text-sm font-semibold text-text-subtle">{`${turn.turnNumber}.`}</div>
            <div className="col-span-5 cursor-pointer" onClick={() => goToMove(turn.whiteMove)}>
              <MoveItem move={turn.whiteMove} currentMoveNode={currentMoveNode} onContextMenu={handleContextMenu} onClick={() => goToMove(turn.whiteMove)} />
              {turn.whiteMove.variantName && <VariantReference name={turn.whiteMove.variantName} />}
            </div>
            <div className="col-span-5 cursor-pointer" onClick={() => turn.blackMove && goToMove(turn.blackMove)}>
              {turn.blackMove ? (
                <>
                  <MoveItem
                    move={turn.blackMove}
                    currentMoveNode={currentMoveNode}
                    onContextMenu={handleContextMenu}
                    onClick={() => goToMove(turn.blackMove as MoveVariantNode)}
                  />
                  {turn.blackMove.variantName && <VariantReference name={turn.blackMove.variantName} />}
                </>
              ) : null}
            </div>
          </div>
        ))
      )}
      {contextMenu.node ? (
        <div
          className="context-menu fixed z-10 overflow-hidden rounded-md border border-border-default bg-surface shadow-elevated"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onMouseLeave={handleCloseContextMenu}
        >
          <div className="cursor-pointer p-2 text-sm transition-colors hover:bg-danger hover:text-text-on-brand" onClick={handleDeleteDialog}>
            Delete
          </div>
          <div className="cursor-pointer p-2 text-sm transition-colors hover:bg-interactive" onClick={handleRenameDialog}>
            Rename
          </div>
        </div>
      ) : null}
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
