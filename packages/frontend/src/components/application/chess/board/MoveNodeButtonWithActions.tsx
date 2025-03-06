import { Menu, MenuItem, MenuItems } from "@headlessui/react";
import React, { useState } from "react";
import { useRepertoireContext } from "../../../../contexts/RepertoireContext";
import { MoveVariantNode } from "../../../../models/VariantNode";
import { TextDialog } from "../../../design/dialogs/TextDialog";
import { MoveButton } from "../../../design/chess/buttons/MoveButton";

interface MoveNodeButtonProps {
  move: MoveVariantNode;
  hasMenu?: boolean;
}

export const MoveNodeButtonWithActions: React.FC<MoveNodeButtonProps> = ({
  move,
  hasMenu = false,
}) => {
  const { goToMove, changeNameMove, deleteMove } =
    useRepertoireContext();

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
    if(!hasMenu) {
      return;
    }
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
        move={move}
        onClick={() => goToMove(move)}
        onContextMenu={(event) => handleContextMenu(event, move)}
        isSelectedMove={false}
        isWhiteMove={move.getMove().color === "w"}
      />
      {contextMenu.node && (
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <MenuItems
              className="absolute z-10 mt-2 w-56 origin-top-right rounded-md shadow-lg focus:outline-none context-menu"
              style={{ top: contextMenu.y, left: contextMenu.x }}
            >
              <div className="py-1">
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => {
                        if (contextMenu.node !== null) {
                          deleteMove(contextMenu.node);
                        }
                        handleCloseContextMenu();
                      }}
                      className={`context-menu-item ${active ? 'active' : ''} group flex items-center px-4 py-2 text-sm`}
                    >
                      Delete
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={handleRenameDialog}
                      className={`context-menu-item ${active ? 'active' : ''} group flex items-center px-4 py-2 text-sm`}
                    >
                      Rename
                    </button>
                  )}
                </MenuItem>
              </div>
            </MenuItems>
          </div>
        </Menu>
      )}
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