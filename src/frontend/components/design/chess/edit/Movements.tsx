import React from "react";
import { MoveVariantNode } from "../../../../models/VariantNode";
import { MovementAndTurnNodeButtonWithActions } from "../../../application/chess/board/MovementAndTurnNodeButtonWithActions";
import styled from "@emotion/styled";

interface MovementsProps {
    moves: MoveVariantNode[] | undefined;
}

const StyledMovementsContainer = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    width: 100%;
    max-height: 263px;
    overflow-y: auto;
`;

export const Movements: React.FC<MovementsProps> = ({ moves }) => {
    const moveComponents = [];
    if(!moves) {
        return null;
    }

    for (let i = 0; i < moves.length; i += 2) {
        const moveWhite = moves[i];
        const moveBlack = moves[i + 1];
        moveComponents.push(
          <MovementAndTurnNodeButtonWithActions
            key={moveWhite.getUniqueKey()}
            moveWhite={moveWhite}
            moveBlack={moveBlack}
          />
        );
      }
    
    return (
        <StyledMovementsContainer>{moveComponents}</StyledMovementsContainer>
    );
};