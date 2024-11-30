import React from "react";
import { AppBar, Toolbar, Typography, IconButton, useMediaQuery, useTheme } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import { useNavbarContext } from "../../../contexts/NavbarContext";
import { useHeaderContext } from "../../../contexts/HeaderContext";

const Header: React.FC = () => {
  const { setOpen } = useNavbarContext();
  const { icons, isSaving } = useHeaderContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AppBar position="relative">
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
          ChessKeep
          </Typography>
          <div style={{ display: "flex", alignItems: "center", marginLeft: isMobile ? 0 : '12px' }}>
            {!isMobile ? (
              <div style={{ display: "flex", alignItems: "center", marginLeft: 2 }}>
                <Typography variant="body2" noWrap sx={{ lineHeight: 'normal' }}>
                  {isSaving ? "Saving repertoire..." : "Last repertoire saved"}
                </Typography>
                <IconButton color="inherit" sx={{ marginLeft: 1 }}>
                  {isSaving ? <CloudOffIcon /> : <CloudDoneIcon />}
                </IconButton>
              </div>
            ) : (
              <IconButton color="inherit" sx={{ marginLeft: 2 }}>
                {isSaving ? <CloudOffIcon /> : <CloudDoneIcon />}
              </IconButton>
            )}
          </div>
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
