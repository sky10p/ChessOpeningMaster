import { useNavigate } from "react-router-dom";
import { IRepertoire } from "@chess-opening-master/common";

const resolveId = (repertoireIdOrObject: string | IRepertoire): string => 
  typeof repertoireIdOrObject === 'string' ? repertoireIdOrObject : repertoireIdOrObject._id;

export const useNavigationUtils = () => {
  const navigate = useNavigate();

  const goToRepertoire = (repertoireIdOrObject: string | IRepertoire, variantName?: string) => {
    const repertoireId = resolveId(repertoireIdOrObject);
    navigate(`/repertoire/${repertoireId}${variantName ? `?variantName=${encodeURIComponent(variantName)}` : ''}`);
  };

  const goToTrainRepertoire = (repertoireIdOrObject: string | IRepertoire, variantName?: string) => {
    const repertoireId = resolveId(repertoireIdOrObject);
    navigate(`/repertoire/train/${repertoireId}${variantName ? `?variantName=${encodeURIComponent(variantName)}` : ''}`);
  };

  return {
    goToRepertoire,
    goToTrainRepertoire,
  };
};
