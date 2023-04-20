import React, { useEffect, useState } from "react";
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import { MoveVariantNode } from "../../utils/VariantNode";
import { Variant } from "../../models/chess.models";
import { MoveNodeButtonWithActions } from "../../buttons/MoveNodeButtonWithActions";

interface VariantTreeProps {
  variants: Variant[];
  currentNode: MoveVariantNode;
}

const VariantTree: React.FC<VariantTreeProps> = ({ variants, currentNode }) => {
  const isSelected = (node: MoveVariantNode) => node === currentNode;
  const [expandedVariant, setExpandedVariant] = useState(0);

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
                  <MoveNodeButtonWithActions
                    key={move.getUniqueKey()}
                    move={move}
                  />
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </>
  );
};

export default VariantTree;
