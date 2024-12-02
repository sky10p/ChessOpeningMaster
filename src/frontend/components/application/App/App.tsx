import { Box } from "@mui/material";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import Content from "../Content/Content";
import FooterContainer from "../FooterContainer/FooterContainer";
import HeaderContainer from "../HeaderContainer/HeaderContainer";
import NavbarContainer from "../NavbarContainer/NavbarContainer";
import { AppContext } from "../../../contexts/AppContext";

const App: React.FC = (): React.ReactElement => {
  return (
    <BrowserRouter>
      <AppContext>
        <Box display="flex" flexDirection="column" height="100dvh">
          <HeaderContainer />
          <Box display="flex" flexDirection="column" flexGrow={1} overflow={"auto"}>
            <NavbarContainer />
            <Content />
          </Box>
          <FooterContainer />
        </Box>
      </AppContext>
    </BrowserRouter>
  );
};

export default App;
