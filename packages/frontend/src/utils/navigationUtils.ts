import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { IRepertoire } from "@chess-opening-master/common";

const resolveId = (repertoireIdOrObject: string | IRepertoire): string => 
  typeof repertoireIdOrObject === 'string' ? repertoireIdOrObject : repertoireIdOrObject._id;

export const useNavigationUtils = () => {
  const navigate = useNavigate();

  const goToRepertoire = useCallback((repertoireIdOrObject: string | IRepertoire, variantName?: string) => {
    const repertoireId = resolveId(repertoireIdOrObject);
    navigate(`/repertoire/${repertoireId}${variantName ? `?variantName=${encodeURIComponent(variantName)}` : ''}`);
  }, [navigate]);

  const goToTrainRepertoire = useCallback((repertoireIdOrObject: string | IRepertoire, variantName?: string) => {
    const repertoireId = resolveId(repertoireIdOrObject);
    navigate(`/repertoire/train/${repertoireId}${variantName ? `?variantName=${encodeURIComponent(variantName)}` : ''}`);
  }, [navigate]);

  return {
    goToRepertoire,
    goToTrainRepertoire,
  };
};
