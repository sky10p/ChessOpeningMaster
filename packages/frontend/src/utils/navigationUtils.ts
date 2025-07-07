import { useNavigate } from "react-router-dom";
import { IRepertoire } from "@chess-opening-master/common";

export const useNavigationUtils = () => {
  const navigate = useNavigate();

  const goToRepertoire = (repertoireIdOrObject: string | IRepertoire, variantName?: string) => {
    const repertoireId = typeof repertoireIdOrObject === 'string' 
      ? repertoireIdOrObject 
      : repertoireIdOrObject._id;
    navigate(`/repertoire/${repertoireId}${variantName ? `?variantName=${variantName}` : ''}`);
  };

  const goToTrainRepertoire = (repertoireIdOrObject: string | IRepertoire, variantName?: string) => {
    const repertoireId = typeof repertoireIdOrObject === 'string' 
      ? repertoireIdOrObject 
      : repertoireIdOrObject._id;
    navigate(`/repertoire/train/${repertoireId}${variantName ? `?variantName=${variantName}` : ''}`);
  };

  return {
    goToRepertoire,
    goToTrainRepertoire,
  };
};
