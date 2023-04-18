import { Box } from "@mui/material";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import Content from "./Content";
import Footer from "./Footer";
import Header from "./Header";
import Navbar from "./Navbar";
import { NavbarContextProvider } from "../../../contexts/NavbarContext";
import { AlertContextProvider } from "../../../contexts/AlertContext";
import { DialogContextProvider } from "../../../contexts/DialogContext";

const App: React.FC = (): React.ReactElement => {
  return (
    <BrowserRouter>
      <AlertContextProvider>
        <DialogContextProvider>
        <NavbarContextProvider>
          <Header />
          <Box
            display="flex"
            flexDirection="row"
            minHeight="calc(100vh - 64px)"
          >
            <Navbar />
            <Content />
          </Box>
          <Footer />
        </NavbarContextProvider>
        </DialogContextProvider>
      </AlertContextProvider>
    </BrowserRouter>
  );
};

export default App;
