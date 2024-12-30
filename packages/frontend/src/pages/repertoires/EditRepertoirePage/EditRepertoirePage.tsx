import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import EditRepertoireViewContainer from "./EditRepertoireViewContainer";
import { getRepertoire } from "../../../repository/repertoires/repertoires";
import { RepertoireContextProvider } from "../../../contexts/RepertoireContext";
import { useNavbarDispatch } from "../../../contexts/NavbarContext";
import { IRepertoire } from "@chess-opening-master/common";

const EditRepertoirePage = () => {
  const { id } = useParams();
  const [repertoire, setRepertoire] = useState<IRepertoire | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const fetchRepertoire = useCallback(async (id: string) => {
    try {
      const repertoire = await getRepertoire(id);
      setRepertoire(repertoire);
    } catch (err) {
      setError("Failed to fetch repertoire");
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

  const { setOpen } = useNavbarDispatch();
  useEffect(() => {
    setOpen(false);
  }, [setOpen]);

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
      <EditRepertoireViewContainer />
    </RepertoireContextProvider>
  ) : (
    <div>Repertoire not found</div>
  );
};

export default EditRepertoirePage;
