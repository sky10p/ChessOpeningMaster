import React from "react";
import { Box, Grid } from "@mui/material";
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
        '&::-webkit-scrollbar': {
          height: '8px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'black',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          backgroundColor: 'darkgray',
        },
      }}
    >
      <Grid
        container
        spacing={2}
        alignItems="center"
        mb={2}
        justifyContent="flex-start"
        wrap="nowrap"
      >
        {actions.map((action, index) => (
          <Grid item key={index}>
            <VariantActionButton
              onClick={action.onClick}
              icon={action.icon}
              label={action.label}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default VariantActionButtons;