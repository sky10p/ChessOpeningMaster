import * as React from "react";
import ReactDOM from "react-dom/client";
import "typeface-roboto";
import App from "./components/application/App/App";
import "./index.css";
import "./contextMenu.css"; // Estilos para menús contextuales

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
