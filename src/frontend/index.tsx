import * as React from "react";
import ReactDOM from "react-dom/client";
import "typeface-roboto";
import { CssBaseline, ThemeProvider } from "@mui/material";
import App from "./components/basic/layout/App";
import theme from "./design/theme";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <CssBaseline />
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
