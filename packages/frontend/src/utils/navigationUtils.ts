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

  const goToRepertoireWithFen = useCallback((repertoireIdOrObject: string | IRepertoire, fen: string, variantName?: string) => {
    const repertoireId = resolveId(repertoireIdOrObject);
    const params = new URLSearchParams();
    params.set("fen", fen);
    if (variantName) {
      params.set("variantName", variantName);
    }
    navigate(`/repertoire/${repertoireId}?${params.toString()}`);
  }, [navigate]);

  const goToTrainRepertoire = useCallback((repertoireIdOrObject: string | IRepertoire, variantName?: string) => {
    const repertoireId = resolveId(repertoireIdOrObject);
    navigate(`/repertoire/train/${repertoireId}${variantName ? `?variantName=${encodeURIComponent(variantName)}` : ''}`);
  }, [navigate]);

  const goToTrainRepertoireWithFen = useCallback((repertoireIdOrObject: string | IRepertoire, fen: string, variantName?: string) => {
    const repertoireId = resolveId(repertoireIdOrObject);
    const params = new URLSearchParams();
    params.set("fen", fen);
    if (variantName) {
      params.set("variantName", variantName);
    }
    navigate(`/repertoire/train/${repertoireId}?${params.toString()}`);
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

  return {
    goToRepertoire,
    goToRepertoireWithFen,
    goToTrainRepertoire,
    goToTrainRepertoireWithFen,
    goToTrainRepertoireWithVariants,
  };
};
