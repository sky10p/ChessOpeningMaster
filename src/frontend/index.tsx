import * as React from "react";
import ReactDOM from "react-dom/client";
import "typeface-roboto";
import { CssBaseline } from "@mui/material";
import App from "./components/basic/layout/App";


const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <CssBaseline />
    <App />
  </React.StrictMode>
);
