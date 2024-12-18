import { Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Button } from "@mui/material";
import React, { useEffect } from "react";

interface NumberDialogProps {
    open: boolean;
    min: number;
    max: number;
    initialValue: number;
    onNumberConfirm: (number: number) => void;
    onClose: () => void;
    title: string;
    contentText: string;
}

export const NumberDialog: React.FC<NumberDialogProps> = ({ open, min, max, initialValue, onNumberConfirm, onClose, title, contentText }) => {
    const [value, setValue] = React.useState(initialValue);

    useEffect(() => {
        if (initialValue !== value) {
            setValue(initialValue);
        }
    }, [initialValue]);

    const handleConfirm = () => {
        const numericValue = Number(value);
        if (numericValue >= min && numericValue <= max) {
            onNumberConfirm(numericValue);
        }
    };

    const isValidNumber = (num: number) => num >= min && num <= max;

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {contentText}
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    type="number"
                    fullWidth
                    value={value === 0 ? '' : value}
                    inputProps={{ min, max }}
                    onChange={(e) => setValue(e.target.value === '' ? 0 : Number(e.target.value))}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleConfirm} disabled={!isValidNumber(Number(value))}>Confirm</Button>
            </DialogActions>
        </Dialog>
    );
};