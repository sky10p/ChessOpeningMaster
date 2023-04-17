import React, { useEffect } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, ButtonBase } from '@mui/material';
import { Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { getRepertoires } from '../../repository/repertoires/repertoires';
import { IRepertoire } from '../../../common/types/Repertoire';
import { useNavbarContext } from '../../contexts/NavbarContext';

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


const Navbar: React.FC = () => {
  const [repertoires, setRepertoires] = React.useState<IRepertoire[]>([]);
  const {open, setOpen} = useNavbarContext();
  useEffect(() => {
    getRepertoires().then((repertoires) => setRepertoires(repertoires));
  }, []);
  return (
    <Drawer  sx={drawerStyles} open={open} onClose={() => setOpen(false)}>
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
          <ButtonBase key={repertoire._id} component={Link} to={`/repertoire/${repertoire._id}`}>
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
