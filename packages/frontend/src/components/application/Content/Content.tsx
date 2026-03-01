import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import CreateRepertoire from "../../../pages/repertoires/CreateRepertoire";
import EditRepertoirePage from "../../../pages/repertoires/EditRepertoirePage/EditRepertoirePage";
import TrainRepertoirePage from "../../../pages/repertoires/TrainRepertoirePage/TrainRepertoirePage";
import { MainContainer } from "../../design/layouts/MainContainer";
import { DashboardPage } from "../../../pages/DashboardPage/DashboardPage";
import PathPage from "../../../pages/PathPage/PathPage";
import StudiesPage from "../../../pages/StudiesPage/StudiesPage";
import LoginPage from "../../../pages/auth/LoginPage";
import RegisterPage from "../../../pages/auth/RegisterPage";
import GamesPage from "../../../pages/games/GamesPage";
import TrainPage from "../../../pages/train/TrainPage";
import TrainOpeningPage from "../../../pages/train/TrainOpeningPage";

interface ContentProps {
  authEnabled: boolean;
  authenticated: boolean;
  allowDefaultUser: boolean;
  onAuthenticated: () => void;
}

const Content: React.FC<ContentProps> = ({ authEnabled, authenticated, allowDefaultUser, onAuthenticated }) => {
  if (authEnabled && !authenticated) {
    return (
      <MainContainer>
        <Routes>
          <Route path="/login" element={<LoginPage allowDefaultUser={allowDefaultUser} onAuthenticated={onAuthenticated} />} />
          <Route path="/register" element={<RegisterPage onAuthenticated={onAuthenticated} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <Routes>
        <Route path="/create-repertoire" element={<CreateRepertoire />} />
        <Route path="/repertoire/:id" element={<EditRepertoirePage />} />
        <Route path="/repertoire/train/:id" element={<TrainRepertoirePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/studies" element={<StudiesPage />} />
        <Route path="/path" element={<PathPage />} />
        <Route path="/train" element={<TrainPage />} />
        <Route
          path="/train/repertoire/:repertoireId/opening/:openingName"
          element={<TrainOpeningPage />}
        />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </MainContainer>
  );
};

export default Content;
