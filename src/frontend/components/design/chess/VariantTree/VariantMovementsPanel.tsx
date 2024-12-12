import React from "react"
import ImportContactsIcon from '@mui/icons-material/ImportContacts';
import { MoveVariantNode } from "../../../../models/VariantNode"
import { Box, Grid, Typography, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import { TextDialog } from "../../dialogs/TextDialog";

interface VariantMovementsPanelProps {
    moves: MoveVariantNode[];
    currentMoveNode: MoveVariantNode;
    maxHeight?: string;
    goToMove: (move: MoveVariantNode) => void;
    deleteMove: (move: MoveVariantNode) => void;
    changeNameMove: (move: MoveVariantNode, newName: string) => void;
}

const MoveItem: React.FC<{
  move: MoveVariantNode;
  currentMoveNode: MoveVariantNode;
  onContextMenu: (event: React.MouseEvent, node: MoveVariantNode) => void;
  onClick: () => void;
}> = ({ move, currentMoveNode, onContextMenu, onClick }) => (
  <Box
    component="span"
    sx={{
      backgroundColor: move === currentMoveNode ? 'primary.main' : 'transparent',
      borderRadius: '0.25rem',
      display: 'inline-block',
      padding: '0.125rem 0.25rem',
      cursor: 'pointer',
      '&:hover': { backgroundColor: 'grey.300' },
      verticalAlign: 'middle',
    }}
    onContextMenu={(event) => onContextMenu(event, move)}
    onClick={onClick}
  >
    <Typography
      component="span"
      fontSize="1rem"
      sx={{ color: move === currentMoveNode ? 'primary.contrastText' : 'text.primary' }}
    >
      {move.getMove().san}
    </Typography>
    {move.variantName && (
      <ImportContactsIcon fontSize="inherit" sx={{ verticalAlign: 'text-top', marginLeft: '0.25rem' }} />
    )}
  </Box>
);

export const VariantMovementsPanel: React.FC<VariantMovementsPanelProps> = ({ moves, currentMoveNode, maxHeight = '25rem', goToMove, deleteMove, changeNameMove }) => {
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

    // Simplify turns creation
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
        <Box
            sx={{
                maxHeight,
                overflowY: 'auto',
                padding: '1rem', // Use rem units for consistency
            }}
        >
            {turns.map((turn, index) => (
                <Grid container key={index} sx={{ padding: '0.5rem 1rem' }}>
                    <Grid item xs={1}>
                        <Typography variant="body2" fontSize="0.875rem">
                            {`${turn.turnNumber}.`}
                        </Typography>
                    </Grid>
                    <Grid item xs={5} onClick={() => goToMove(turn.whiteMove)} style={{cursor: "pointer"}}>
                        <MoveItem
                            move={turn.whiteMove}
                            currentMoveNode={currentMoveNode}
                            onContextMenu={handleContextMenu}
                            onClick={() => goToMove(turn.whiteMove)}
                        />
                        {turn.whiteMove.variantName && (
                            <Typography variant="body2" sx={{ marginLeft: '0.5rem', display: 'inline', fontSize: '0.875rem' }}>
                                {turn.whiteMove.variantName}
                            </Typography>
                        )}
                    </Grid>
                    <Grid item xs={5} onClick={() => turn.blackMove && goToMove(turn.blackMove)} style={{cursor: "pointer"}}>
                        {turn.blackMove && (
                            <>
                                <MoveItem
                                    move={turn.blackMove}
                                    currentMoveNode={currentMoveNode}
                                    onContextMenu={handleContextMenu}
                                    onClick={() => turn.blackMove && goToMove(turn.blackMove)}
                                />
                                {turn.blackMove.variantName && (
                                    <Typography variant="body2" sx={{ marginLeft: '0.5rem', display: 'inline', fontSize: '0.875rem' }}>
                                        {turn.blackMove.variantName}
                                    </Typography>
                                )}
                            </>
                        )}
                    </Grid>
                </Grid>
            ))}
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
        </Box>
    );
}