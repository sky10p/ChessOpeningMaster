import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Checkbox,
  FormControlLabel,
  Typography,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { GroupedVariant } from "./models";
import { VariantsProgressBar } from './VariantsProgressBar';
import { getTextColor } from "./utils";
import { TrainVariantInfo } from "../../../models/chess.models";

interface SelectTrainVariantProps {
  variantName: string;
  subvariants: GroupedVariant[];
  variantsInfo: Record<string, TrainVariantInfo>;
  isGroupSelected: (groupName: string) => boolean;
  isSomeOfGroupSelected: (groupName: string) => boolean;
  handleSelectAllGroup: (groupName: string) => void;
  isCheckedVariant: (variantIndex: number) => boolean;
  handleToggleVariant: (variantIndex: number) => void;
}

export const SelectTrainVariants: React.FC<SelectTrainVariantProps> = ({
  variantName,
  subvariants,
  isGroupSelected,
  isSomeOfGroupSelected,
  handleSelectAllGroup,
  isCheckedVariant,
  handleToggleVariant,
  variantsInfo,
}) => {
 
  return (
    <Accordion>
      <AccordionSummary
        expandIcon={subvariants.length > 1 ? <ExpandMoreIcon /> : null}
        aria-controls={`${variantName}-content`}
        id={`${variantName}-header`}
        onClick={(event) => {
          if (subvariants.length <= 1) {
            event.stopPropagation();
          }
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <FormControlLabel
            onClick={(event) => event.stopPropagation()}
            onFocus={(event) => event.stopPropagation()}
            control={
              <Checkbox
                checked={isGroupSelected(variantName)}
                indeterminate={isSomeOfGroupSelected(variantName)}
                onChange={() => handleSelectAllGroup(variantName)}
              />
            }
            label={<Typography>{variantName}</Typography>}
          />
          <VariantsProgressBar variants={subvariants} variantInfo={variantsInfo} />
        </Box>
      </AccordionSummary>
      {subvariants.length > 1 && (
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', ml: 3 }}>
            {subvariants.map((variant) => (
              <FormControlLabel
                key={variant.originalIndex}
                control={
                  <Checkbox
                    checked={isCheckedVariant(variant.originalIndex)}
                    onChange={() => handleToggleVariant(variant.originalIndex)}
                  />
                }
                label={<Typography style={{ color: getTextColor(variant, {}) }}>{variant.variant.fullName}</Typography>}
              />
            ))}
          </Box>
        </AccordionDetails>
      )}
    </Accordion>
  );
};
