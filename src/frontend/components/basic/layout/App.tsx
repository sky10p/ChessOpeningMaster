import { Box } from "@mui/material";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import Content from "./Content";
import Footer from "./Footer";
import Header from "./Header";
import Navbar from "./Navbar";
import { AppContext } from "../../../contexts/AppContext";

const App: React.FC = (): React.ReactElement => {
  return (
    <BrowserRouter>
      <AppContext>
        <Box display="flex" flexDirection="column" height="100dvh">
          <Header />
          <Box display="flex" flexDirection="column" flexGrow={1} overflow={"auto"}>
            <Navbar />
            <Content />
          </Box>
          <Footer />
        </Box>
      </AppContext>
    </BrowserRouter>
  );
};

export default App;
