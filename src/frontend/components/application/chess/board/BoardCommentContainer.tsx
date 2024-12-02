import React from "react"
import { useRepertoireContext } from "../../../../contexts/RepertoireContext";
import { BoardComment } from "../../../design/chess/BoardComment";

interface BoardCommentContainerProps {
  editable?: boolean;
}
export const BoardCommentContainer: React.FC<BoardCommentContainerProps> = ({editable = true}) => {
    const {comment, updateComment} = useRepertoireContext();

    return (
        <BoardComment editable={editable} comment={comment} updateComment={updateComment} />
      );
}