import { Button, ButtonProps, Menu, MenuItem, styled } from "@mui/material";
import React, { useState } from "react";
import { MoveVariantNode } from "../utils/VariantNode";
import { useRepertoireContext } from "../../../contexts/RepertoireContext";
import { TextDialog } from "../../basic/dialogs/TextDialog";

interface MoveNodeButtonProps {
  moveWhite: MoveVariantNode;
  moveBlack?: MoveVariantNode;
}

interface MoveButtonProps extends ButtonProps {
  isSelectedMove: boolean;
}

export const MovementAndTurnNodeButtonWithActions: React.FC<MoveNodeButtonProps> = ({
  moveWhite, moveBlack,
}) => {
  const { goToMove, changeNameMove, deleteMove, currentMoveNode } =
    useRepertoireContext();
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
    if (contextRenameDialog.node !== null) {
      changeNameMove(contextRenameDialog.node, newName);
    }
    handleCloseRenameDialog();
  };

  const MovementContainer = styled("div")({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "5px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    backgroundColor: "#f9f9f9",
    boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
  });

   const MoveButton = styled(Button)<MoveButtonProps>(({isSelectedMove}) => ({
    minWidth: "40px",
    minHeight: "30px",
    margin: "2px",
    padding: "2px 4px",
    textTransform: "none",
    fontSize: "0.9rem",
    fontWeight: "normal",
    ...(isSelectedMove ? {
      backgroundColor: "#3f51b5",
      color: "white",
      borderColor: "#3f51b5",
    } : {} ),
    '&:hover':{
      backgroundColor: '#0069d9',
      borderColor: '#0062cc',
      boxShadow: 'none',
      color: "white"
    },
  }));

  return (
    <>
    <MovementContainer>
      <span>{moveWhite.turn}</span>
      <MoveButton
        key={moveWhite.getUniqueKey()}
        variant="outlined"
        onClick={() => goToMove(moveWhite)}
        onContextMenu={(event) => handleContextMenu(event, moveWhite)}
        color={isSelected(moveWhite) ? "primary" : "inherit"}
        isSelectedMove={isSelected(moveWhite)}
      >
        {moveWhite.getMove().san} {moveWhite.variantName ? "*" : ""}
      </MoveButton>
      {moveBlack && <MoveButton
        key={moveBlack.getUniqueKey()}
        variant="outlined"
        onClick={() => goToMove(moveBlack)}
        onContextMenu={(event) => handleContextMenu(event, moveBlack)}
        color={isSelected(moveBlack) ? "primary" : "inherit"}
        isSelectedMove={isSelected(moveBlack)}
      >
        {moveBlack.getMove().san}  {moveBlack.variantName ? "*" : ""}
      </MoveButton>}
    </MovementContainer>
     
     
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
        initialValue={contextRenameDialog.node?.variantName || ""}
        onClose={handleCloseRenameDialog}
        title="Rename Move"
        contentText="Please enter the new name for the move:"
        onTextConfirm={handleRenameNode}
      />
    </>
  );
};
