import { Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Button } from "@mui/material"
import React, { useEffect } from "react"

interface TextDialogProps {
    open: boolean;
    initialValue: string;
    onTextConfirm: (text: string) => void;
    onClose: () => void;
    title: string;
    contentText: string;
}

export const TextDialog: React.FC<TextDialogProps> = ({open, initialValue, onTextConfirm, onClose, title, contentText: contextText}) => {

    const [value, setValue] = React.useState(initialValue)

    useEffect(() => {
      if(initialValue && initialValue !== value){
        setValue(initialValue)
      }
    }, [initialValue])

    return <Dialog open={open} onClose={onClose}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <DialogContentText>
        {contextText}
      </DialogContentText>
      <TextField
        autoFocus
        margin="dense"
        id="name"
        type="text"
        fullWidth
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={() => onTextConfirm(value)}>Rename</Button>
    </DialogActions>
  </Dialog>
}