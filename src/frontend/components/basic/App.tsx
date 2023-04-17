import { Box } from "@mui/material";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import Content from "./Content";
import Footer from "./Footer";
import Header from "./Header";
import Navbar from "./Navbar";
import {
  NavbarContextProvider,
} from "../../contexts/NavbarContext";

const App: React.FC = (): React.ReactElement => {

  return (
    <BrowserRouter>
      <NavbarContextProvider>
        <Header />
        <Box display="flex" flexDirection="row" minHeight="calc(100vh - 64px)">
          <Navbar />
          <Content />
        </Box>
        <Footer />
      </NavbarContextProvider>
    </BrowserRouter>
  );
};

export default App;
