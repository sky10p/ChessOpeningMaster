import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../../../pages/Home";
import CreateRepertoire from "../../../pages/repertoires/CreateRepertoire";
import EditRepertoirePage from "../../../pages/repertoires/EditRepertoirePage/EditRepertoirePage";
import TrainRepertoirePage from "../../../pages/repertoires/TrainRepertoryPage/TrainRepertoirePage";

const contentStyles: React.CSSProperties = {
  flexGrow: 1,
  padding: "1rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

const Content = () => {
  return (
    <main style={contentStyles}>
      <Routes>
        <Route path="/create-repertoire" element={<CreateRepertoire />} />
        <Route path="/edit-repertoire" element={<div>Edit repertoire</div>} />
        {/*  <Route path="/manage-repertoires" element={<ManageRepertoirePage/>} /> */}
        <Route
          path="/remove-repertoire"
          element={<div>Delete repertoire</div>}
        />
        <Route path="/repertoire/:id" element={<EditRepertoirePage />} />
        <Route path="/repertoire/train/:id" element={<TrainRepertoirePage />} />

        <Route path="/" element={<Home />} />
      </Routes>
    </main>
  );
};

export default Content;
