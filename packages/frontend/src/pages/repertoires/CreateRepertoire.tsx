import React from "react";
import { Navigate } from "react-router-dom";

const CreateRepertoire: React.FC = () => {
  return <Navigate to="/repertoires?create=1" replace />;
};

export default CreateRepertoire;
