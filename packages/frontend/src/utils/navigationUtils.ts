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

  const goToTrainRepertoireWithVariants = useCallback(
    (repertoireIdOrObject: string | IRepertoire, variantNames: string[]) => {
      const repertoireId = resolveId(repertoireIdOrObject);
      if (!variantNames.length) {
        navigate(`/repertoire/train/${repertoireId}`);
        return;
      }
      const params = new URLSearchParams();
      params.set("variantNames", variantNames.join("|"));
      navigate(`/repertoire/train/${repertoireId}?${params.toString()}`);
    },
    [navigate]
  );

  const goToTrainOpening = useCallback(
    (repertoireIdOrObject: string | IRepertoire, openingName: string) => {
      const repertoireId = resolveId(repertoireIdOrObject);
      navigate(
        `/train/repertoire/${repertoireId}/opening/${encodeURIComponent(
          openingName
        )}`
      );
    },
    [navigate]
  );

  return {
    goToRepertoire,
    goToTrainRepertoire,
    goToTrainRepertoireWithVariants,
    goToTrainOpening,
  };
};
