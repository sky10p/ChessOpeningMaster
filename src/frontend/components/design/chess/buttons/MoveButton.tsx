import React from "react";
import { MoveVariantNode } from "../../../../models/VariantNode";
import { Button, styled, Tooltip } from "@mui/material";
import ImportContactsIcon from '@mui/icons-material/ImportContacts';

interface MoveButtonProps {
  move: MoveVariantNode;
  isSelectedMove: boolean;
  onContextMenu: (event: React.MouseEvent, move: MoveVariantNode) => void;
  onClick: (move: MoveVariantNode) => void;
  isWhiteMove: boolean;
}

interface StyledButtonProps {
  isSelectedMove: boolean;
}

const StyledButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "isSelectedMove" && prop !== "isWhiteMove",
})<StyledButtonProps & { isWhiteMove: boolean }>(({ isSelectedMove, isWhiteMove }) => ({
  minWidth: "40px",
  minHeight: "30px",
  margin: "2px",
  padding: "2px 4px",
  textTransform: "none",
  fontSize: "0.9rem",
  fontWeight: "normal",
  backgroundColor: isWhiteMove ? "#ffffff" : "#333333",
  color: isWhiteMove ? "#000000" : "#ffffff",
  ...(isSelectedMove
    ? {
        backgroundColor: "#3f51b5",
        color: "white",
        borderColor: "#3f51b5",
      }
    : {}),
  "&:hover": {
    backgroundColor: isWhiteMove ? "#e0e0e0" : "#555555",
    borderColor: isWhiteMove ? "#d0d0d0" : "#444444",
    boxShadow: "none",
    color: isWhiteMove ? "#000000" : "#ffffff",
  },
}));

const ButtonContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '30px',
  width: '63px',
});

const IconContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  '& .MuiSvgIcon-root': {
    fontSize: '16px',
  },
});

export const MoveButton: React.FC<MoveButtonProps & { isWhiteMove: boolean }> = ({
  move,
  isSelectedMove,
  onContextMenu,
  onClick,
  isWhiteMove,
}) => {
  return (
    <Tooltip title={move.variantName || ''} arrow>
      <StyledButton
        variant="outlined"
        onContextMenu={(event) => onContextMenu(event, move)}
        onClick={() => onClick(move)}
        color={isSelectedMove ? "primary" : "inherit"}
        isSelectedMove={isSelectedMove}
        isWhiteMove={isWhiteMove}
      >
        <ButtonContainer>
          {move.getMove().san}
          {move.variantName && (
            <IconContainer>
              <ImportContactsIcon fontSize="small" />
            </IconContainer>
          )}
        </ButtonContainer>
      </StyledButton>
    </Tooltip>
  );
};
