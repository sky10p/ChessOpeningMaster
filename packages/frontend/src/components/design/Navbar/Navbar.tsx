import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  ButtonBase,
  ListItemSecondaryAction,
  IconButton,
  ListItemIcon,
} from "@mui/material";
import { Link } from "react-router-dom";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import chessNavbarBackground from "../../../assets/chess-navbar-background.jpg";
import { NavbarLink } from "./model";

const drawerWidth = 350;

const drawerStyles = {
  width: drawerWidth,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    width: drawerWidth,
    boxSizing: "border-box",
    zIndex: 1,
    top: "64px",
  },
};

interface NavbarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  mainActions: NavbarLink[];
  secondaryActions: NavbarLink[];
}

export const Navbar: React.FC<NavbarProps> = ({ open, setOpen, mainActions, secondaryActions }) => {
  return (
    <Drawer sx={drawerStyles} open={open} onClose={() => setOpen(false)}>
      <img
        src={chessNavbarBackground}
        alt="Chess Navbar Background"
        style={{
          width: "100%",
          height: "81px",
          objectFit: "cover",
          marginBottom: "16px",
        }}
      />
      <List>
        {mainActions.map((link) => (
            <ButtonBase key={link.id} component={Link} to={`${link.url}`} onClick={() => setOpen(false)}>
                <ListItem>
                    <ListItemIcon>{link.icon}</ListItemIcon>
                    <ListItemText primary={link.name} />
                </ListItem>
            </ButtonBase>
        ))}
        <Divider />
        {secondaryActions.map((link) => (
          <ListItem key={link.id}>
            <ButtonBase
              component={Link}
              to={`${link.url}`}
              onClick={() => setOpen(false)}
            >
              <ListItemText primary={link.name} />
            </ButtonBase>
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="up-order"
                onClick={link.onActionClick}
              >
                <MoreVertIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};
