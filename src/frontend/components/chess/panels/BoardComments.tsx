import { Box, TextField, Typography } from "@mui/material";
import React from "react"
import { useRepertoireContext } from "../../../contexts/RepertoireContext";

export const BoardComment = () => {
    const {comment, updateComment} = useRepertoireContext();
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        updateComment(event.target.value);
        };
    return (
        <Box>
          <Typography variant="h6" gutterBottom>
            Comments
          </Typography>
          <TextField
        label="Add a comment to the current position"
        multiline
        rows={10}
        value={comment}
        onChange={handleChange}
        variant="outlined"
        fullWidth
      />
        </Box>
      );
}