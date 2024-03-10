import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import React from "react";
import { useState } from "react";

interface SelectNextMoveDialogProps {
  open: boolean;
  title: string;
  contentText: string;
  nextMovements: string[];
  onConfirm: (nextMove: string) => void;
  onClose: () => void;
}

const SelectNextMoveDialog: React.FC<SelectNextMoveDialogProps> = ({
  open,
  title,
  contentText,
  nextMovements,
  onConfirm,
  onClose,
}) => {
  const [selectedNextMove, setSelectedNextMove] = useState<string >(nextMovements[0]);

  const handleNextMoveConfirm = () => {
    onConfirm(selectedNextMove);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{contentText}</DialogContentText>
        <RadioGroup
            value={selectedNextMove}
            onChange={(e) => setSelectedNextMove(e.target.value)}
        >
            {nextMovements.map((nextMove) => (
                <FormControlLabel value={nextMove} control={<Radio/>} label={nextMove} />
            ))}
            
        </RadioGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleNextMoveConfirm} color="primary">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SelectNextMoveDialog;
