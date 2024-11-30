import * as React from "react";
import ReactDOM from "react-dom/client";
import "typeface-roboto";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "./design/theme";
import App from "./components/basic/layout/App";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
