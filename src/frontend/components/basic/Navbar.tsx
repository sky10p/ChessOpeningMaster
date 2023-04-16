import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, ButtonBase } from '@mui/material';
import { Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';

const drawerWidth = 240;

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

const repertoires = [
  { id: 1, name: 'Main Repertoire' },
  { id: 2, name: 'Secondary Repertoire' },
  { id: 3, name: 'Repertoire Under Construction' },
];

interface NavbarProps {
  open: boolean;
  onClose: () => void;
}

const Navbar: React.FC<NavbarProps> = ({open, onClose}) => {
  return (
    <Drawer  sx={drawerStyles} open={open} onClose={onClose}>
      <List>
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
          <ButtonBase key={repertoire.id} component={Link} to={`/repertoire/${repertoire.id}`}>
            <ListItem>
              <ListItemText primary={repertoire.name} />
            </ListItem>
          </ButtonBase>
        ))}
      </List>
    </Drawer>
  );
};

export default Navbar;
