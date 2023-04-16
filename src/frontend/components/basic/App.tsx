import { Box } from "@mui/material";
import React, { useState } from "react";
import { BrowserRouter } from "react-router-dom";
import Content from "./Content";
import Footer from "./Footer";
import Header from "./Header";
import Navbar from "./Navbar";

const App: React.FC = (): React.ReactElement => {
    const [open, setOpen] = useState(false);

    const handleDrawerOpen = () => {
        setOpen(true);
      };
    
      const handleDrawerClose = () => {
        setOpen(false);
      };

    return (
      <BrowserRouter>
        <Header onMenuClicked={handleDrawerOpen} />
        <Box
          display="flex"
          flexDirection="row"
          minHeight="calc(100vh - 64px)"
          width="calc(100% - 240px)"
        >
          <Navbar open={open} onClose={handleDrawerClose} />
          <Content />
        </Box>
        <Footer />
      </BrowserRouter>
    );
  };

  export default App;