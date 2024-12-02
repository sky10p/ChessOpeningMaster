import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from "@mui/material";
import { IRepertoire } from "../../../../common/types/Repertoire";

interface RepertoireDialogProps {
  open: boolean;
  title: string;
  contentText: string;
  repertoires: IRepertoire[];
  onConfirm: (repertoire: IRepertoire) => void;
  onClose: () => void;
}

const RepertoireDialog: React.FC<RepertoireDialogProps> = ({ open, title, contentText, repertoires, onConfirm, onClose }) => {
  const [selectedRepertoire, setSelectedRepertoire] = useState<IRepertoire | null>(repertoires.length > 0 ? repertoires[0] : null);

  const handleRepertoireConfirm = () => {
    if (selectedRepertoire) {
      onConfirm(selectedRepertoire);
    }
    onClose();
  };

  const handleChange = (e: SelectChangeEvent<string>) => {
    const selected = repertoires.find(r => r._id === e.target.value);
    if (selected) {
      setSelectedRepertoire(selected);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{contentText}</DialogContentText>
        <FormControl variant="outlined" fullWidth style={{ marginTop: '16px' }}>
          <InputLabel id="select-repertoire-label">Repertoire</InputLabel>
          <Select
            labelId="select-repertoire-label"
            id="select-repertoire"
            value={selectedRepertoire ? selectedRepertoire._id : ""}
            label="Repertoire"
            onChange={handleChange}
          >
            {repertoires.map((repertoire) => (
              <MenuItem key={repertoire._id} value={repertoire._id}>
                {repertoire.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleRepertoireConfirm} color="primary" disabled={!selectedRepertoire}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RepertoireDialog;