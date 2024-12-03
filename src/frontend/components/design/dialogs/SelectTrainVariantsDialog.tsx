import React, { useEffect, useState, useMemo } from "react";
import { TrainVariant } from "../../../models/chess.models";
import {
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogContentText,
  TextField,
} from "@mui/material";
import { SelectTrainVariants } from "../SelectTrainVariants/SelectTrainVariants";

interface SelectTrainVariantsDialogProps {
  open: boolean;
  title: string;
  contentText: string;
  trainVariants: TrainVariant[];
  onConfirm: (trainVariants: TrainVariant[]) => void;
  onClose: () => void;
}

interface GroupedTrainVariant extends TrainVariant {
  originalIndex: number;
}

const SelectTrainVariantsDialog: React.FC<SelectTrainVariantsDialogProps> = ({
  open,
  title,
  contentText,
  trainVariants,
  onConfirm,
  onClose,
}) => {
  const [selectedTrainVariants, setSelectedTrainVariants] = useState<
    Set<number>
  >(new Set());
  const [filterText, setFilterText] = useState("");

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterText(event.target.value);
  };

  const groupedTrainVariantsByName = useMemo(() => {
    return trainVariants.reduce(
      (groupedTrainVariants, trainVariant, index) => {
        const groupName = trainVariant.variant.name;
        if (!groupedTrainVariants[groupName]) {
          groupedTrainVariants[groupName] = [];
        }
        groupedTrainVariants[groupName].push({...trainVariant, originalIndex: index});
        return groupedTrainVariants;
      },
      {} as Record<string, GroupedTrainVariant[]>
    );
  }, [trainVariants]);

  const filteredGroupedTrainVariantsByName = useMemo(() => {
    return Object.keys(groupedTrainVariantsByName).reduce(
      (filteredGroups, groupName) => {
        const filteredVariants = groupedTrainVariantsByName[groupName].filter((trainVariant) =>
          trainVariant.variant.fullName.toLowerCase().includes(filterText.toLowerCase())
        );
        if (filteredVariants.length > 0) {
          filteredGroups[groupName] = filteredVariants;
        }
        return filteredGroups;
      },
      {} as Record<string, GroupedTrainVariant[]>
    );
  }, [groupedTrainVariantsByName, filterText]);

  useEffect(() => {
    if (open) {
      setSelectedTrainVariants(
        new Set(
          trainVariants
            .map((trainVariant, index) =>
              trainVariant.state !== "finished" ? index : -1
            )
            .filter((variantIndex) => variantIndex !== -1)
        )
      );
      setFilterText("");
    }
  }, [open, trainVariants]);

  const handleToggleVariant = (variantIndex: number) => {
    const newSelectedVariants = new Set(selectedTrainVariants);
    if (newSelectedVariants.has(variantIndex)) {
      newSelectedVariants.delete(variantIndex);
    } else {
      newSelectedVariants.add(variantIndex);
    }
    setSelectedTrainVariants(newSelectedVariants);
  };

  const handleSelectAll = () => {
    if (selectedTrainVariants.size === trainVariants.length) {
      setSelectedTrainVariants(new Set());
    } else {
      setSelectedTrainVariants(
        new Set(trainVariants.map((trainVariant, index) => index))
      );
    }
  };

  const handleSelectAllGroup = (groupName: string) => {
    const group = groupedTrainVariantsByName[groupName];
    const newSelectedVariants = new Set(selectedTrainVariants);
    if (isGroupSelected(groupName)) {
      group.forEach((trainVariant) => newSelectedVariants.delete(trainVariant.originalIndex));
    } else {
      group.forEach((trainVariant) => newSelectedVariants.add(trainVariant.originalIndex));
    }
    setSelectedTrainVariants(newSelectedVariants);
  };

  const handleClose = () => {
    setSelectedTrainVariants(new Set());
    setFilterText("");
    onClose();
  };

  const handleConfirm = () => {
      const updatedTrainVariants = trainVariants.filter((trainVariant, index) => selectedTrainVariants.has(index));
    onConfirm(updatedTrainVariants);
    handleClose();
  };

  const isAllSelected = selectedTrainVariants.size === trainVariants.length;
  const isGroupSelected = (groupName: string) => {
    const group = groupedTrainVariantsByName[groupName];
    return group.every((trainVariant) => selectedTrainVariants.has(trainVariant.originalIndex));
  };
  const isSomeOfGroupSelected = (groupName: string) => {
    const group = groupedTrainVariantsByName[groupName];
    return group.some((trainVariant) => selectedTrainVariants.has(trainVariant.originalIndex)) && !isGroupSelected(groupName);
  };
  const isSomeSelected = selectedTrainVariants.size > 0 && !isAllSelected;

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
        {Object.keys(filteredGroupedTrainVariantsByName).map((groupName) => (
          <div key={groupName}>
            <SelectTrainVariants
              variantName={groupName}
              subvariants={filteredGroupedTrainVariantsByName[groupName]}
              isGroupSelected={isGroupSelected}
              isSomeOfGroupSelected={isSomeOfGroupSelected}
              isCheckedVariant={(variantIndex) => selectedTrainVariants.has(variantIndex)}
              handleSelectAllGroup={handleSelectAllGroup}
              handleToggleVariant={handleToggleVariant}/>
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

export default SelectTrainVariantsDialog;
