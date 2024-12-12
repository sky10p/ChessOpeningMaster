import { Box, TextField, Typography, Paper } from "@mui/material";
import React from "react";
import { styled } from "@mui/system";

interface BoardCommentProps {
  comment: string;
  updateComment: (comment: string) => void;
  editable?: boolean;
}

// Definir un TextField personalizado con fondo blanco y texto negro
const CustomTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: theme.palette.primary.main,
    },
    "&:hover fieldset": {
      borderColor: theme.palette.primary.dark,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.dark,
    },
    backgroundColor: "#FFFFFF", // Fondo blanco
  },
  "& .MuiInputBase-input": {
    color: "#000000", // Texto negro
  },
  "& .MuiInputLabel-root": {
    color: theme.palette.text.secondary,
    "&.Mui-focused": {
      color: theme.palette.primary.main,
    },
  },
  "& .Mui-disabled .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.grey[400],
  },
  "& .Mui-disabled": {
    backgroundColor: theme.palette.grey[200],
    color: "#000000",
  },
}));

export const BoardComment: React.FC<BoardCommentProps> = ({
  editable = true,
  comment,
  updateComment,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateComment(event.target.value);
  };
  return (
    <Paper
      elevation={3}
      sx={{ padding: "1rem", backgroundColor: "background.paper" }}
    >
      {!editable && (!comment || comment === "") ? (
        <Typography variant="body2" color="text.secondary">
          No comments
        </Typography>
      ) : (
        <CustomTextField
          label="Add a comment to the current position"
          multiline
          disabled={!editable}
          rows={10}
          value={comment}
          onChange={handleChange}
          variant="outlined" // Mantener 'outlined'
          fullWidth
        />
      )}
    </Paper>
  );
};
