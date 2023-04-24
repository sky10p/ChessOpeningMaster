import React, { useEffect, useState } from "react";
import { TrainVariant } from "../../chess/models/chess.models";
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
} from "@mui/material";

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

  const groupedTrainVariantsByName = trainVariants.reduce(
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

  useEffect(() => {
    setSelectedTrainVariants(
      new Set(
        trainVariants
          .map((trainVariant, index) =>
            trainVariant.state !== "finished" ? index : -1
          )
          .filter((variantIndex) => variantIndex !== -1)
      )
    );
  }, [trainVariants]);

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

    onClose();
  };

  const handleConfirm = () => {
    const updatedTrainVariants = trainVariants.map(
      (trainVariant, index) =>
        ({
          ...trainVariant,
          state: selectedTrainVariants.has(index) ? "inProgress" : "finished",
        } as TrainVariant)
    );
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
        <DialogContentText>{contentText}</DialogContentText>
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
        {Object.keys(groupedTrainVariantsByName).map((groupName) => (
          <div key={groupName}>
            <Box sx={{ display: "flex", alignItems: "center" }}>

            <Checkbox checked={isGroupSelected(groupName)} indeterminate={isSomeOfGroupSelected(groupName)} onChange={() => handleSelectAllGroup(groupName)} />
            <h3>{groupName}</h3>
            </Box>
            {groupedTrainVariantsByName[groupName].length > 1 && groupedTrainVariantsByName[groupName].map((trainVariant) => (
              <FormControlLabel
                key={trainVariant.originalIndex}
                control={
                  <Checkbox
                    checked={selectedTrainVariants.has(trainVariant.originalIndex)}
                    onChange={() => handleToggleVariant(trainVariant.originalIndex)}
                  />
                }
                label={trainVariant.variant.fullName}
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

export default SelectTrainVariantsDialog;
