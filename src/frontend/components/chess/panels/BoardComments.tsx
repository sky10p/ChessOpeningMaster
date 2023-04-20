import { Box, TextField, Typography } from "@mui/material";
import React from "react"

export const BoardComments = () => {
    const [comments, setComments] = React.useState<string>("");

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setComments(event.target.value);
        };
    return (
        <Box>
          <Typography variant="h6" gutterBottom>
            Comments
          </Typography>
          <TextField
        label="Add a comment to the current position"
        multiline
        rows={20}
        value={comments}
        onChange={handleChange}
        variant="outlined"
        fullWidth
      />
        </Box>
      );
}