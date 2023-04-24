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
} from "@mui/material";

interface SelectTrainVariantsDialogProps {
  open: boolean;
  title: string;
  contentText: string;
  trainVariants: TrainVariant[];
  onConfirm: (trainVariants: TrainVariant[]) => void;
  onClose: () => void;
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
        {trainVariants.map((trainVariant, index) => (
          <FormControlLabel
            key={index}
            control={
              <Checkbox
                checked={selectedTrainVariants.has(index)}
                onChange={() => handleToggleVariant(index)}
              />
            }
            label={trainVariant.variant.fullName}
          />
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
