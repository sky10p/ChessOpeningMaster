import React, { useEffect, useState } from 'react';
import { Button, Box, styled, Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { MoveVariantNode } from './utils/VariantNode';
import { Variant } from './chess.models';

interface VariantTreeProps {
  variants: Variant[];
  currentNode: MoveVariantNode;
  onClickNode: (node: MoveVariantNode) => void;
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

const VariantTree: React.FC<VariantTreeProps> = ({ variants, currentNode, onClickNode }) => {
  const isSelected = (node: MoveVariantNode) => node === currentNode;
  const [expandedVariant, setExpandedVariant] = useState(0);

  useEffect(()=>{
    setExpandedVariant(variants.findIndex((variant) => variant.moves.some((move) => isSelected(move))));
  }, [variants])

  const handleAccordionChange = (index: number) => {
    setExpandedVariant(expandedVariant === index ? -1 : index);
  };

  return (
    <Box>
      {variants.map((variant, index) => (
        <Accordion key={index} expanded={expandedVariant === index} onChange={() => handleAccordionChange(index)}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`variant-content-${index}`}
            id={`variant-header-${index}`}
          >
            <Typography>Variant {index + 1}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              {variant.moves.map((move) => (
                <MoveButton key={move.getMove().lan} variant="outlined" onClick={() => onClickNode(move)} color={isSelected(move) ? 'primary' : 'inherit'}>
                  {move.getMove().san}
                </MoveButton>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default VariantTree;
