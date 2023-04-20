import React from "react";
import { AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavbarContext } from "../../../contexts/NavbarContext";
import { useHeaderContext } from "../../../contexts/HeaderContext";

const Header: React.FC = () => {
  const {setOpen} = useNavbarContext()
  const {icons} = useHeaderContext();

  return (
    <AppBar position="fixed">
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu" onClick={() => setOpen(true)}>
          <MenuIcon></MenuIcon>
        </IconButton>
        <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
          Chess Opening Master
        </Typography>
        {icons.map((icon) => {
          return <IconButton key={icon.key} color="inherit" onClick={icon.onClick}>
            {icon.icon}
        </IconButton>
        })}   
      </Toolbar>
    </AppBar>
  );
};

export default Header;
