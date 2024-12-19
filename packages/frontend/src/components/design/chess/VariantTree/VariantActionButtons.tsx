import React from "react";
import { Box } from "@mui/material";
import VariantActionButton from "./VariantActionButton";

interface VariantActionButtonsProps {
  actions: {
    onClick: () => void;
    icon: React.ReactElement;
    label: string;
  }[];
}

const VariantActionButtons: React.FC<VariantActionButtonsProps> = ({ actions }) => {
  return (
    <Box
      style={{ overflowX: "auto", maxWidth: "100%", marginBottom: "20px" }}
      sx={{
        display: 'flex',
        gap: 2,
        alignItems: 'center',
      }}
    >
      {actions.map((action, index) => (
        <VariantActionButton
          key={index}
          onClick={action.onClick}
          icon={action.icon}
          label={action.label}
        />
      ))}
    </Box>
  );
};

export default VariantActionButtons;