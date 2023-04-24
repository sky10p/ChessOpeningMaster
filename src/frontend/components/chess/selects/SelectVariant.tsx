import React from "react";
import { Variant } from "../models/chess.models";
import {
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
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

  return (
    <FormControl variant="outlined" sx={{ minWidth: "100%" }}>
      <InputLabel id="select-variant-label">Variant</InputLabel>
      <Select
        native
        labelId="select-variant-label"
        id="select-variant"
        value={selectedVariant.fullName}
        label="Variant"
        onChange={handleChange}
      >
        {Object.keys(groupedVariants).sort().flatMap((name) => [
          <optgroup key={name} label={name}>
            {groupedVariants[name].map((variant) => (
              <option key={variant.fullName} value={variant.fullName}>
                {variant.fullName}
              </option>
            ))}
          </optgroup>,
        ])}
      </Select>
    </FormControl>
  );
};
