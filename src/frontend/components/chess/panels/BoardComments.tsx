import { Box, TextField, Typography } from "@mui/material";
import React from "react"
import { useRepertoireContext } from "../../../contexts/RepertoireContext";

interface BoardCommentProps {
  editable?: boolean;
}
export const BoardComment: React.FC<BoardCommentProps> = ({editable = true}) => {
    const {comment, updateComment} = useRepertoireContext();
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        updateComment(event.target.value);
        };
    return (
        <Box>
          <Typography variant="h6" gutterBottom>
            Comments
          </Typography>
      {!editable && (!comment || comment === "") ? <span>No comments</span>:     <TextField
        label="Add a comment to the current position"
        multiline
        disabled={!editable}
        rows={10}
        value={comment}
        onChange={handleChange}
        variant="outlined"
        fullWidth
      />}
        </Box>
      );
}