import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const TrainPage: React.FC = () => {
  const location = useLocation();
  return <Navigate to={`/repertoires${location.search || ""}`} replace />;
};

export default TrainPage;
