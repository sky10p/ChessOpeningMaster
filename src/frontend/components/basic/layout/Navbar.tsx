import React, { useEffect } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, ButtonBase, ListItemSecondaryAction, IconButton, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { IRepertoire } from '../../../../common/types/Repertoire';
import { useNavbarContext } from '../../../contexts/NavbarContext';
import { deleteRepertoire, duplicateRepertoire, putRepertoireName, putRepertoireOrderUp } from '../../../repository/repertoires/repertoires';
import { useDialogContext } from '../../../contexts/DialogContext';

import chessNavbarBackground from '../../../assets/chess-navbar-background.jpg';
import { API_URL } from '../../../repository/constants';

const drawerWidth = 350;

const drawerStyles = {
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    zIndex: 1,
    top: '64px',
  },
};


const Navbar: React.FC = () => {
  const {open, setOpen, repertoires, updateRepertoires} = useNavbarContext();
  const {showConfirmDialog, showTextDialog} = useDialogContext();
  const navigate = useNavigate();
  useEffect(() => {
    updateRepertoires();
  }, []);

  const handleEdit = (repertoire: IRepertoire) => {
    showTextDialog({
      title: 'Edit Repertoire',
      contentText: 'Enter a new name for the repertoire',
      onTextConfirm: async (newName: string) => {
        await putRepertoireName(repertoire._id, newName);
        updateRepertoires();
        navigate(`/repertoire/${repertoire._id}`)
      }
    })
  };

  const handleDuplicate = (repertoire: IRepertoire) => {
    showTextDialog({
      title: 'Duplicate Repertoire',
      contentText: 'Enter a new name for the repertoire',
      onTextConfirm: async (newName: string) => {
        await duplicateRepertoire(repertoire._id, newName); 
        updateRepertoires();
        navigate(`/repertoire/${repertoire._id}`)
      }
    });
  };

  const handleOrderUp = async (repertoire: IRepertoire) => {
    await putRepertoireOrderUp(repertoire._id);
    updateRepertoires();
  };

  const handleDelete = (repertoire: IRepertoire) => {
    showConfirmDialog({
      title: 'Delete Repertoire',
      contentText: `Are you sure you want to delete ${repertoire.name}?`,
      onConfirm: async () => {
        await deleteRepertoire(repertoire._id);
        updateRepertoires();
      }
    })
  
  };

  return (
    <Drawer  sx={drawerStyles} open={open} onClose={() => setOpen(false)}>
      <img src={chessNavbarBackground} alt="Chess Navbar Background" style={{width: '100%', height: "81px", objectFit: "cover", marginBottom: "16px"}}/>
      <List>
        
        <ButtonBase component={Link} to={`${API_URL}/repertoires/download`}>
          <ListItem>
            <ListItemIcon>
              <FileDownloadIcon />
            </ListItemIcon>
            <ListItemText primary="Download Repertoires" />
          </ListItem>
        </ButtonBase>
        <ButtonBase component={Link} to="/create-repertoire">
          <ListItem>
            <ListItemIcon>
              <AddIcon />
            </ListItemIcon>
            <ListItemText primary="Create Repertoire" />
          </ListItem>
        </ButtonBase>
        <Divider />
        {repertoires.map((repertoire) => (
          
            <ListItem key={repertoire._id}>
              <ButtonBase  component={Link} to={`/repertoire/${repertoire._id}`} onClick={() => setOpen(false)}>
              <ListItemText primary={repertoire.name} />
              </ButtonBase>
              <ListItemSecondaryAction>
              <IconButton edge="end" aria-label="up-order" onClick={() => handleOrderUp(repertoire)}>
                  <ArrowUpwardIcon />
                </IconButton>
              <IconButton edge="end" aria-label="duplicate" onClick={() => handleDuplicate(repertoire)}>
                  <FileCopyIcon />
                </IconButton>
                <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(repertoire)}>
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDelete(repertoire)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
        ))}
        
      </List>
    </Drawer>
  );
};

export default Navbar;
