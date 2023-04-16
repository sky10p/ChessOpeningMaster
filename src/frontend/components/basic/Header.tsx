import React from "react";
import { AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import { useLocation } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuIcon from "@mui/icons-material/Menu";


interface HeaderProps {
  onMenuClicked: () => void;
}

const Header: React.FC<HeaderProps> = ({onMenuClicked}) => {
  const location = useLocation();
  const isRepertoireView = location.pathname.startsWith("/repertoire/");

  return (
    <AppBar position="fixed">
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu" onClick={onMenuClicked}>
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
