import React from "react";

import { useRepertoireContext } from "../../../../contexts/RepertoireContext";
import BoardActions from "../../../design/chess/board/BoardActions.tailwind";

const BoardActionsContainer: React.FC = () => {

const {next, prev, hasNext, hasPrev, rotateBoard} = useRepertoireContext();
  return (
    <BoardActions next={next} prev={prev} hasNext={hasNext} hasPrev={hasPrev} rotateBoard={rotateBoard} />
  );
};

export default BoardActionsContainer;
