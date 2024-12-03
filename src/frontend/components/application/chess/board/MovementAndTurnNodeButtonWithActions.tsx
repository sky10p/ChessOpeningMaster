import { Menu, MenuItem, styled } from "@mui/material";
import React, { useState } from "react";
import { MoveVariantNode } from "../../../../models/VariantNode";
import { useRepertoireContext } from "../../../../contexts/RepertoireContext";
import { TextDialog } from "../../../design/dialogs/TextDialog";
import { MoveButton } from "../../../design/chess/buttons/MoveButton";

interface MoveNodeButtonProps {
  moveWhite: MoveVariantNode;
  moveBlack?: MoveVariantNode;
}


export const MovementAndTurnNodeButtonWithActions: React.FC<
  MoveNodeButtonProps
> = ({ moveWhite, moveBlack }) => {
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
    backgroundColor: "#00000024",
    boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.1)",
  });

  return (
    <>
      <MovementContainer>
        <span>{moveWhite.turn}</span>
        <MoveButton
          key={moveWhite.getUniqueKey()}
          move={moveWhite}
          onClick={(move) => goToMove(move)}
          onContextMenu={(event) => handleContextMenu(event, moveWhite)}
          isSelectedMove={isSelected(moveWhite)}
          isWhiteMove={true}
        />
        {moveBlack && (
          <MoveButton
            key={moveBlack.getUniqueKey()}
            move={moveBlack}
            onClick={() => goToMove(moveBlack)}
            onContextMenu={(event) => handleContextMenu(event, moveBlack)}
            isSelectedMove={isSelected(moveBlack)}
            isWhiteMove={false}
          />
        )}
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
