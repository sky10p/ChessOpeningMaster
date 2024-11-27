import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { IRepertoire } from "../../../../common/types/Repertoire";
import { getRepertoire } from "../../../repository/repertoires/repertoires";
import { useNavbarContext } from "../../../contexts/NavbarContext";
import { RepertoireContextProvider } from "../../../contexts/RepertoireContext";
import TrainRepertoireViewContainer from "./TrainRepertoireViewContainer";
import { TrainRepertoireContextProvider } from "../../../contexts/TrainRepertoireContext";

const TrainRepertoirePage = () => {
  const { id } = useParams();
  const [repertoire, setRepertoire] = useState<IRepertoire | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRepertoire = useCallback(async (id: string) => {
    try {
      const repertoire = await getRepertoire(id);
      setRepertoire(repertoire);
    } catch (error) {
      console.error("Failed to fetch repertoire", error);
      setError("Failed to fetch repertoire. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  const refetchRepertoire = useCallback(() => {
    if (id) {
      fetchRepertoire(id);
    }
  }, [id, fetchRepertoire]);

  useEffect(() => {
    refetchRepertoire();
  }, [refetchRepertoire]);

  const { setOpen } = useNavbarContext();
  useEffect(() => {
    setOpen(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return repertoire?._id ? (
    <RepertoireContextProvider
      repertoireId={repertoire._id}
      repertoireName={repertoire.name}
      initialMoves={repertoire.moveNodes}
      initialOrientation={repertoire.orientation ?? "white"}
      updateRepertoire={refetchRepertoire}
    >
      <TrainRepertoireContextProvider>
        <TrainRepertoireViewContainer />
      </TrainRepertoireContextProvider>
    </RepertoireContextProvider>
  ) : (
    <div>Repertoire not found</div>
  );
};

export default TrainRepertoirePage;
