import React, { useEffect, useState } from "react";
import {
  Box,
} from "@mui/material";
import { MoveVariantNode } from "../../utils/VariantNode";
import { Variant } from "../../models/chess.models";
import { MoveNodeButtonWithActions } from "../../buttons/MoveNodeButtonWithActions";
import { SelectVariant } from "../../selects/SelectVariant";

interface VariantTreeProps {
  variants: Variant[];
  currentNode: MoveVariantNode;
}

const VariantTree: React.FC<VariantTreeProps> = ({ variants, currentNode }) => {
  const isSelected = (node: MoveVariantNode) => node === currentNode;
  const [selectedVariant, setSelectedVariant] = useState<Variant>(variants[0]); // TODO: [0

  useEffect(() => {
    setSelectedVariant(
      variants.find((variant) =>
        variant.moves.some((move) => isSelected(move))
      ) ?? variants[0]
    );
  }, [variants]);

 

  return (
    <>
      {" "}
      <Box>
        <SelectVariant variants={variants} selectedVariant={selectedVariant} onSelectVariant={setSelectedVariant}></SelectVariant>
        <Box>
                {selectedVariant.moves.map((move) => (
                  <MoveNodeButtonWithActions
                    key={move.getUniqueKey()}
                    move={move}
                  />
                ))}
              </Box>
      </Box>
    </>
  );
};

export default VariantTree;
