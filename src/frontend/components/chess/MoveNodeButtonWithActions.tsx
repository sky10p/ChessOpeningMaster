import { Button, Menu, MenuItem, styled } from "@mui/material";
import React, { useState } from "react";
import { MoveVariantNode } from "./utils/VariantNode";
import { useBoardContext } from "./BoardContext";
import { TextDialog } from "../basic/dialogs/TextDialog";

interface MoveNodeButtonProps {
  move: MoveVariantNode;
}

const MoveButton = styled(Button)({
  minWidth: "40px",
  minHeight: "30px",
  margin: "2px",
  padding: "2px 4px",
  textTransform: "none",
  fontSize: "0.9rem",
  fontWeight: "normal",
});

export const MoveNodeButtonWithActions: React.FC<MoveNodeButtonProps> = ({
  move,
}) => {
  const { goToMove, changeNameMove, deleteMove, currentMoveNode } =
    useBoardContext();
  const isSelected = (node: MoveVariantNode) => node === currentMoveNode;

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    node: MoveVariantNode | null;
  }>({ x: 0, y: 0, node: null });
  const [contextRenameDialog, setContextRenameDialog] = useState<{
    open: boolean;
    node: MoveVariantNode | null;
  }>({ open: false, node: null });

  const handleContextMenu = (
    event: React.MouseEvent,
    node: MoveVariantNode
  ) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, node });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({ x: 0, y: 0, node: null });
  };

  const handleRenameDialog = () => {
    setContextRenameDialog({
      ...contextRenameDialog,
      node: contextMenu.node,
      open: true,
    });
    handleCloseContextMenu();
  };

  const handleCloseRenameDialog = () => {
    setContextRenameDialog({ open: false, node: null });
  };

  const handleRenameNode = (newName: string) => {
    if (contextRenameDialog.node !== null && newName !== "") {
      changeNameMove(contextRenameDialog.node, newName);
    }
    handleCloseRenameDialog();
  };

  return (
    <>
      <MoveButton
        key={move.getUniqueKey()}
        variant="outlined"
        onClick={() => goToMove(move)}
        onContextMenu={(event) => handleContextMenu(event, move)}
        color={isSelected(move) ? "primary" : "inherit"}
      >
        {move.getMove().san}
      </MoveButton>
      <Menu
        open={contextMenu.node !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu.node !== null
            ? { top: contextMenu.y, left: contextMenu.x }
            : undefined
        }
      >
        <MenuItem
          onClick={() => {
            if (contextMenu.node !== null) {
              deleteMove(contextMenu.node);
            }
            handleCloseContextMenu();
          }}
        >
          Delete
        </MenuItem>
        <MenuItem onClick={handleRenameDialog}>Rename</MenuItem>
      </Menu>
      <TextDialog
        open={contextRenameDialog.open}
        onClose={handleCloseRenameDialog}
        title="Rename Move"
        contentText="Please enter the new name for the move:"
        onTextConfirm={handleRenameNode}
      />
    </>
  );
};
