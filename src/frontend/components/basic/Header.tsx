import React from 'react';
import { AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import { useLocation } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const drawerWidth = 240;

const Header = () => {
  const location = useLocation();
  const isRepertoireView = location.pathname.startsWith('/repertoire/');

  return (
    <AppBar position="fixed" sx={{ width: `calc(100% - ${drawerWidth}px)` }}>
      <Toolbar>
        <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
          Chess Opening Master
        </Typography>
        {isRepertoireView && (
          <>
            <IconButton color="inherit">
              <EditIcon />
            </IconButton>
            <IconButton color="inherit">
              <DeleteIcon />
            </IconButton>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
