import React, { useEffect, useMemo, useState } from "react";
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
  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>(variants[0]); // TODO: [0

  useEffect(() => {
    setSelectedVariant(
      variants.find((variant) =>
        variant.moves.some((move) => isSelected(move))
      ) ?? variants[0]
    );
  }, [variants]);

 const moveNodesWithActions = useMemo(()=>{
  const moves = selectedVariant?.moves;
  const moveComponents = [];
  
  if (moves) {
    for (let i = 0; i < moves.length; i += 2) {
      const moveWhite = moves[i];
      const moveBlack = moves[i + 1]; 
      moveComponents.push(
        <MoveNodeButtonWithActions
          key={moveWhite.getUniqueKey()}
          moveWhite={moveWhite}
          moveBlack={moveBlack}
        />
      );
    }
  } 

  return moveComponents;
 }, [selectedVariant]);

  return (
    <>
      {" "}
      <Box>
        {selectedVariant && <SelectVariant variants={variants} selectedVariant={selectedVariant} onSelectVariant={setSelectedVariant}></SelectVariant>}
        <Box>
                {moveNodesWithActions}
              </Box>
      </Box>
    </>
  );
};

export default VariantTree;
