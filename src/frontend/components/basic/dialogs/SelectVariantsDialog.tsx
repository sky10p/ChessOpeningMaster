import React, { useEffect, useState, useMemo } from "react";
import { Variant } from "../../chess/models/chess.models";
import {
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogContentText,
  Box,
  TextField,
} from "@mui/material";

interface SelectVariantsDialogProps {
  open: boolean;
  title: string;
  contentText: string;
  variants: Variant[];
  onConfirm: (variants: Variant[]) => void;
  onClose: () => void;
}

interface GroupedVariant extends Variant {
  originalIndex: number;
}

const SelectVariantsDialog: React.FC<SelectVariantsDialogProps> = ({
  open,
  title,
  contentText,
  variants,
  onConfirm,
  onClose,
}) => {
  const [selectedVariants, setSelectedVariants] = useState<Set<number>>(new Set());
  const [filterText, setFilterText] = useState("");

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterText(event.target.value);
  };

  const groupedVariantsByName = useMemo(() => {
    return variants.reduce(
      (groupedVariants, variant, index) => {
        const groupName = variant.name;
        if (!groupedVariants[groupName]) {
          groupedVariants[groupName] = [];
        }
        groupedVariants[groupName].push({...variant, originalIndex: index});
        return groupedVariants;
      },
      {} as Record<string, GroupedVariant[]>
    );
  }, [variants]);

  const filteredGroupedVariantsByName = useMemo(() => {
    return Object.keys(groupedVariantsByName).reduce(
      (filteredGroups, groupName) => {
        const filteredVariants = groupedVariantsByName[groupName].filter((variant) =>
          variant.fullName.toLowerCase().includes(filterText.toLowerCase())
        );
        if (filteredVariants.length > 0) {
          filteredGroups[groupName] = filteredVariants;
        }
        return filteredGroups;
      },
      {} as Record<string, GroupedVariant[]>
    );
  }, [groupedVariantsByName, filterText]);

  useEffect(() => {
    if (open) {
      setSelectedVariants(new Set());
      setFilterText("");
    }
  }, [open]);

  const handleToggleVariant = (variantIndex: number) => {
    const newSelectedVariants = new Set(selectedVariants);
    if (newSelectedVariants.has(variantIndex)) {
      newSelectedVariants.delete(variantIndex);
    } else {
      newSelectedVariants.add(variantIndex);
    }
    setSelectedVariants(newSelectedVariants);
  };

  const handleSelectAll = () => {
    if (selectedVariants.size === variants.length) {
      setSelectedVariants(new Set());
    } else {
      setSelectedVariants(
        new Set(variants.map((variant, index) => index))
      );
    }
  };

  const handleSelectAllGroup = (groupName: string) => {
    const group = groupedVariantsByName[groupName];
    const newSelectedVariants = new Set(selectedVariants);
    if (isGroupSelected(groupName)) {
      group.forEach((variant) => newSelectedVariants.delete(variant.originalIndex));
    } else {
      group.forEach((variant) => newSelectedVariants.add(variant.originalIndex));
    }
    setSelectedVariants(newSelectedVariants);
  };

  const handleClose = () => {
    setSelectedVariants(new Set());
    setFilterText("");
    onClose();
  };

  const handleConfirm = () => {
    const updatedVariants = variants.filter((_, index) => selectedVariants.has(index));
    onConfirm(updatedVariants);
    handleClose();
  };

  const isAllSelected = selectedVariants.size === variants.length;
  const isGroupSelected = (groupName: string) => {
    const group = groupedVariantsByName[groupName];
    return group.every((variant) => selectedVariants.has(variant.originalIndex));
  };
  const isSomeOfGroupSelected = (groupName: string) => {
    const group = groupedVariantsByName[groupName];
    return group.some((variant) => selectedVariants.has(variant.originalIndex)) && !isGroupSelected(groupName);
  };
  const isSomeSelected = selectedVariants.size > 0 && !isAllSelected;

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>{contentText}</DialogContentText>
        <TextField
          label="Filter Variants"
          variant="outlined"
          fullWidth
          value={filterText}
          onChange={handleFilterChange}
          sx={{ mb: 2 }}
        />
        <div><FormControlLabel
          control={
            <Checkbox
              checked={isAllSelected}
              indeterminate={isSomeSelected}
              onChange={handleSelectAll}
            />
          }
          label="Select All"
        /></div>
        {Object.keys(filteredGroupedVariantsByName).map((groupName) => (
          <div key={groupName}>
            <Box sx={{ display: "flex", alignItems: "center" }}>

            <Checkbox checked={isGroupSelected(groupName)} indeterminate={isSomeOfGroupSelected(groupName)} onChange={() => handleSelectAllGroup(groupName)} />
            <h3>{groupName}</h3>
            </Box>
            {filteredGroupedVariantsByName[groupName].length > 1 && filteredGroupedVariantsByName[groupName].map((variant) => (
              <FormControlLabel
                key={variant.originalIndex}
                control={
                  <Checkbox
                    checked={selectedVariants.has(variant.originalIndex)}
                    onChange={() => handleToggleVariant(variant.originalIndex)}
                  />
                }
                label={variant.fullName}
              />
            ))}
          </div>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleConfirm}>Confirm</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SelectVariantsDialog;
