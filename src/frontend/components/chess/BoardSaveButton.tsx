import React, { useState } from 'react';
import { Button, Snackbar } from '@mui/material';
import Alert, { AlertColor } from '@mui/material/Alert';
import { useBoardContext } from './BoardContext';
import { putRepertoire } from '../../repository/repertoires/repertoires';

const BoardSaveButton = () => {
  const { repertoireId, repertoireName, moveHistory } = useBoardContext();
  const [open, setOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>('success');
  const [alertMessage, setAlertMessage] = useState('Repertoire saved successfully.');

  const onSave = async () => {
    try {
      setOpen(true);
      setAlertSeverity('info');
      setAlertMessage('Saving repertoire...');
      await putRepertoire(repertoireId, repertoireName, moveHistory.getMoveNodeWithoutParent());
      setAlertSeverity('success');
      setAlertMessage('Repertoire saved successfully.');
    } catch (error) {
      setOpen(true);
      setAlertSeverity('error');
      setAlertMessage('Error saving repertoire.');
    }
  };

  return (
    <>
      <Button variant="contained" color="primary" onClick={onSave}>
        Save
      </Button>
      <Snackbar open={open} autoHideDuration={6000} onClose={() => setOpen(false)}>
        <Alert onClose={() => setOpen(false)} severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default BoardSaveButton;
