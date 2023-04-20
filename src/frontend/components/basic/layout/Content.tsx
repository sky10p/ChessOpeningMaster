import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../../../pages/Home";
import CreateRepertoire from "../../../pages/repertoires/CreateRepertoire";
import Repertoire from "../../../pages/repertoires/Repertoire";

const headerHeight = 64;

const contentStyles: React.CSSProperties = {
  flexGrow: 1,
  marginTop: headerHeight,
  padding: "1rem",
};

const Content = () => {
  return (
    <main style={contentStyles}>
      <Routes>
        <Route
          path="/create-repertoire"
          element={<CreateRepertoire/>}
        />
        <Route path="/edit-repertoire" element={<div>Edit repertoire</div>} />
        <Route
          path="/remove-repertoire"
          element={<div>Delete repertoire</div>}
        />
        <Route path="/repertoire/:id" element={<Repertoire/>} />

        <Route path="/" element={<Home/>} />
      </Routes>
    </main>
  );
};

export default Content;
