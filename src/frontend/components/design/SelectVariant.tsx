import React from "react";
import { Variant } from "../../models/chess.models";
import {
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  MenuItem,
  ListSubheader,
  useTheme,
  useMediaQuery,
} from "@mui/material";

interface SelectVariantProps {
  variants: Variant[];
  selectedVariant: Variant;
  onSelectVariant: (variant: Variant) => void;
}

export const SelectVariant: React.FC<SelectVariantProps> = ({
  variants,
  selectedVariant,
  onSelectVariant,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const groupedVariants = variants.reduce((acc, variant) => {
    if (!acc[variant.name]) {
      acc[variant.name] = [];
    }
    acc[variant.name].push(variant);
    return acc;
  }, {} as Record<string, Variant[]>);

  const handleChange = (event: SelectChangeEvent<string>) => {
    const variant = variants.find(
      (variant) => variant.fullName === event.target.value
    );
    if (variant) {
      onSelectVariant(variant);
    }
  };

  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: isMobile ? 400 : 500, // Adjust the height as needed
      },
    },
  };

  const validVariant = variants.find(
    (variant) => variant.fullName === selectedVariant.fullName
  );
  const selectedValue = validVariant ? selectedVariant.fullName : "";

  return (
    <FormControl variant="outlined" sx={{ width: "100%" }}>
      <InputLabel id="select-variant-label">Variant</InputLabel>
      <Select
        labelId="select-variant-label"
        id="select-variant"
        value={selectedValue}
        label="Variant"
        onChange={handleChange}
        MenuProps={MenuProps}
      >
        {Object.keys(groupedVariants)
          .sort()
          .flatMap((name) => [
            <ListSubheader key={`header-${name}`} style={{ backgroundColor: theme.palette.custom.black, color: "white", fontSize: "1.2rem", fontWeight: "bold" }}>
              {name}
            </ListSubheader>,
            ...groupedVariants[name].map((variant) => (
              <MenuItem key={`item-${variant.fullName}`} value={variant.fullName} style={{ backgroundColor: "white", color: "black", fontSize: "1rem" }}>
                {variant.fullName}
              </MenuItem>
            )),
          ])}
      </Select>
    </FormControl>
  );
};
