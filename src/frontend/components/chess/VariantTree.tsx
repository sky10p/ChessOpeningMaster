import React, { useEffect, useState } from "react";
import {
  Button,
  Box,
  styled,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Menu,
  MenuItem,
} from "@mui/material";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import { MoveVariantNode } from "./utils/VariantNode";
import { Variant } from "./chess.models";
import { TextDialog } from "../basic/dialogs/TextDialog";

interface VariantTreeProps {
  variants: Variant[];
  currentNode: MoveVariantNode;
  onClickNode: (node: MoveVariantNode) => void;
  onDeleteNode: (node: MoveVariantNode) => void;
  onChangeNodeName: (node: MoveVariantNode, newName: string) => void;
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

const VariantTree: React.FC<VariantTreeProps> = ({
  variants,
  currentNode,
  onClickNode,
  onDeleteNode,
  onChangeNodeName,
}) => {
  const isSelected = (node: MoveVariantNode) => node === currentNode;
  const [expandedVariant, setExpandedVariant] = useState(0);
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
      onChangeNodeName(contextRenameDialog.node, newName);
    }
    handleCloseRenameDialog();
  };

  useEffect(() => {
    setExpandedVariant(
      variants.findIndex((variant) =>
        variant.moves.some((move) => isSelected(move))
      )
    );
  }, [variants]);

  const handleAccordionChange = (index: number) => {
    setExpandedVariant(expandedVariant === index ? -1 : index);
  };

  return (
    <>
      {" "}
      <Box>
        {variants.map((variant, index) => (
          <Accordion
            key={index}
            expanded={expandedVariant === index}
            onChange={() => handleAccordionChange(index)}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`variant-content-${index}`}
              id={`variant-header-${index}`}
            >
              <Typography>{variant.name}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                {variant.moves.map((move) => (
                  <MoveButton
                    key={move.getMove().lan}
                    variant="outlined"
                    onClick={() => onClickNode(move)}
                    onContextMenu={(event) => handleContextMenu(event, move)}
                    color={isSelected(move) ? "primary" : "inherit"}
                  >
                    {move.getMove().san}
                  </MoveButton>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
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
              onDeleteNode(contextMenu.node);
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

export default VariantTree;
