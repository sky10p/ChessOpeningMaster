import React from "react";
import { AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import { useLocation } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavbarContext } from "../../../contexts/NavbarContext";




const Header: React.FC = () => {
  const {setOpen} = useNavbarContext()
  const location = useLocation();
  const isRepertoireView = location.pathname.startsWith("/repertoire/");

  return (
    <AppBar position="fixed">
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu" onClick={() => setOpen(true)}>
          <MenuIcon></MenuIcon>
        </IconButton>
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
