import React from "react";
import { IRepertoire } from "../../../../common/types/Repertoire";
import { MoveVariantNode } from "../../../models/VariantNode";
import { Button, Box, List, ListItem, ListItemText, useTheme, useMediaQuery } from "@mui/material";
import { Variant } from "../../../models/chess.models";

interface ManageVariantProps {
  repertoire: IRepertoire | undefined;
  onDeleteRepertoire: (variant: Variant) => void;
}

const ManageVariant: React.FC<ManageVariantProps> = ({ repertoire, onDeleteRepertoire }) => {
  if (!repertoire || !repertoire.moveNodes) return null;
  const rootNode = MoveVariantNode.initMoveVariantNode(repertoire.moveNodes);
  const variants = rootNode.getVariants();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <List style={{ maxHeight: 300, overflow: 'auto' }}>
      {variants.map((variant) => (
        <ListItem key={variant.fullName} style={{ flexDirection: isMobile ? 'column' : 'row' }}>
          <ListItemText primary={variant.fullName} />
          <Box display="flex" justifyContent="flex-end">
            <Button variant="outlined" color="primary" size="small">Move</Button>
            <Button variant="outlined" color="info" size="small" style={{ marginLeft: 8 }}>Copy</Button>
            <Button variant="outlined" color="error" size="small" style={{ marginLeft: 8 }} onClick={() => onDeleteRepertoire(variant)}>Delete</Button>
          </Box>
        </ListItem>
      ))}
    </List>
  );
};

export default ManageVariant;