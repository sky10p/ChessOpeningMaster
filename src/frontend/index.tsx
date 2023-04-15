import * as React from "react";
import ReactDOM from "react-dom/client";
import "typeface-roboto";
import { CssBaseline } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import Header from "./components/basic/Header";
import Navbar from "./components/basic/Navbar";
import { Box } from "@mui/material";
import Content from "./components/basic/Content";
import Footer from "./components/basic/Footer";

const App: React.FC = (): React.ReactElement => {
  return (
    <BrowserRouter>
      <Header />
      <Box
        display="flex"
        flexDirection="row"
        minHeight="calc(100vh - 64px)"
        width="calc(100% - 240px)"
      >
        <Navbar />
        <Content />
      </Box>
      <Footer />
    </BrowserRouter>
  );
};
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <CssBaseline />
    <App />
  </React.StrictMode>
);
