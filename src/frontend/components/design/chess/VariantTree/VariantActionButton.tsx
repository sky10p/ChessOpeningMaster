import React from "react";
import { Box, IconButton, Typography } from "@mui/material";

interface VariantActionButtonProps {
  onClick: () => void;
  icon: React.ReactElement;
  label: string;
}

const VariantActionButton: React.FC<VariantActionButtonProps> = ({
  onClick,
  icon,
  label,
}) => (
  <Box display="flex" flexDirection="column" alignItems="center">
    <IconButton onClick={onClick} sx={{ color: "rgb(47, 51, 55)" }}>
      {icon}
    </IconButton>
    <Typography
      variant="caption"
      align="center"
      style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
    >
      {label}
    </Typography>
  </Box>
);

export default VariantActionButton;