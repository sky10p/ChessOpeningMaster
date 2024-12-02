import { Dialog, DialogTitle, DialogContent, DialogContentText,DialogActions, Button } from "@mui/material"
import React from "react"

interface TextDialogProps {
    open: boolean;
    onConfirm: () => void;
    onClose: () => void;
    title: string;
    contentText: string;
}

export const ConfirmDialog: React.FC<TextDialogProps> = ({open, onConfirm, onClose, title, contentText: contextText}) => {

    return <Dialog open={open} onClose={onClose}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <DialogContentText>
        {contextText}
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={() => onConfirm()}>Confirm</Button>
    </DialogActions>
  </Dialog>
}