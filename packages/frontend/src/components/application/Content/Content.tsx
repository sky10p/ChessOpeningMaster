import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import CreateRepertoire from "../../../pages/repertoires/CreateRepertoire";
import EditRepertoirePage from "../../../pages/repertoires/EditRepertoirePage/EditRepertoirePage";
import TrainRepertoirePage from "../../../pages/repertoires/TrainRepertoirePage/TrainRepertoirePage";
import { MainContainer } from "../../design/layouts/MainContainer";
import { DashboardPage } from "../../../pages/DashboardPage";



const Content = () => {
  return (
    <MainContainer>
      <Routes>
        <Route path="/create-repertoire" element={<CreateRepertoire />} />
        <Route path="/edit-repertoire" element={<div>Edit repertoire</div>} />
        <Route
          path="/remove-repertoire"
          element={<div>Delete repertoire</div>}
        />
        <Route path="/repertoire/:id" element={<EditRepertoirePage />} />
        <Route path="/repertoire/train/:id" element={<TrainRepertoirePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </MainContainer>
  );
};

export default Content;
