import React from 'react';
import { Button } from '@mui/material';
import { useBoardContext } from './BoardContext';
import { putRepertoire } from '../../repository/repertoires/repertoires';
import { useAlertContext } from '../../contexts/AlertContext';

const BoardSaveButton = () => {
  const { repertoireId, repertoireName, moveHistory, orientation } = useBoardContext();
  const {showAlert} = useAlertContext();

  const onSave = async () => {
    try {
      showAlert('Saving repertoire...', 'info');
      await putRepertoire(repertoireId, repertoireName, moveHistory.getMoveNodeWithoutParent(), orientation);
      showAlert('Repertoire saved successfully.', 'success');
    } catch (error) {
      showAlert('Error saving repertoire.', 'error');
    
    }
  };

  return (
    <>
      <Button variant="contained" color="primary" onClick={onSave}>
        Save
      </Button>
    </>
  );
};

export default BoardSaveButton;
