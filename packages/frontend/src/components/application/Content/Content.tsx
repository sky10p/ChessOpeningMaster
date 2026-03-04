import React from "react";
import { Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import CreateRepertoire from "../../../pages/repertoires/CreateRepertoire";
import EditRepertoirePage from "../../../pages/repertoires/EditRepertoirePage/EditRepertoirePage";
import TrainRepertoirePage from "../../../pages/repertoires/TrainRepertoirePage/TrainRepertoirePage";
import RepertoiresPage from "../../../pages/repertoires/RepertoiresPage";
import { MainContainer } from "../../design/layouts/MainContainer";
import { DashboardPage } from "../../../pages/DashboardPage/DashboardPage";
import PathPage from "../../../pages/PathPage/PathPage";
import StudiesPage from "../../../pages/StudiesPage/StudiesPage";
import LoginPage from "../../../pages/auth/LoginPage";
import RegisterPage from "../../../pages/auth/RegisterPage";
import GamesPage from "../../../pages/games/GamesPage";
import TrainPage from "../../../pages/train/TrainPage";
import TrainOpeningPage from "../../../pages/train/TrainOpeningPage";
import {
  getLegacyTrainExecutionRedirectTarget,
  getLegacyTrainOpeningRedirectTarget,
} from "../../../utils/appRoutes";

const LegacyTrainExecutionRedirect: React.FC = () => {
  const { id = "" } = useParams();
  const location = useLocation();
  return <Navigate to={getLegacyTrainExecutionRedirectTarget(id, location.search)} replace />;
};

const LegacyTrainOpeningRedirect: React.FC = () => {
  const { repertoireId = "", openingName = "" } = useParams();
  const location = useLocation();
  return (
    <Navigate
      to={getLegacyTrainOpeningRedirectTarget(repertoireId, openingName, location.search)}
      replace
    />
  );
};

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
        <Route path="/repertoires" element={<RepertoiresPage />} />
        <Route
          path="/repertoires/:repertoireId/openings/:openingName"
          element={<TrainOpeningPage />}
        />
        <Route path="/repertoire/:id" element={<EditRepertoirePage />} />
        <Route path="/train/repertoires/:repertoireId" element={<TrainRepertoirePage />} />
        <Route path="/repertoire/train/:id" element={<LegacyTrainExecutionRedirect />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/studies" element={<StudiesPage />} />
        <Route path="/path" element={<PathPage />} />
        <Route path="/train" element={<TrainPage />} />
        <Route
          path="/train/repertoire/:repertoireId/opening/:openingName"
          element={<LegacyTrainOpeningRedirect />}
        />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </MainContainer>
  );
};

export default Content;
