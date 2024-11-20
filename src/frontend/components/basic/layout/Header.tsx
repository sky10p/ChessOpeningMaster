import React from "react";
import { AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavbarContext } from "../../../contexts/NavbarContext";
import { useHeaderContext } from "../../../contexts/HeaderContext";

const Header: React.FC = () => {
  const { setOpen } = useNavbarContext();
  const { icons, isSaving } = useHeaderContext();

  return (
    <AppBar position="fixed">
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={() => setOpen(true)}
        >
          <MenuIcon></MenuIcon>
        </IconButton>
        <div style={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
          <Typography variant="h6" noWrap>
            Chess Opening Master
          </Typography>

          <Typography variant="body2" noWrap sx={{ marginLeft: 2, lineHeight: 'normal' }}>
            {isSaving ? "Saving repertoire..." : "Last repertoire saved"}
          </Typography>
        </div>
        {icons.map((icon) => {
          return (
            <IconButton key={icon.key} color="inherit" onClick={icon.onClick}>
              {icon.icon}
            </IconButton>
          );
        })}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
