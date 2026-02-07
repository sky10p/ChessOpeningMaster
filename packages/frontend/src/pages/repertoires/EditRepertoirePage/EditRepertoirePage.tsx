import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import EditRepertoireViewContainer from "./EditRepertoireViewContainer";
import { RepertoireContextProvider } from "../../../contexts/RepertoireContext";
import { useNavbarDispatch } from "../../../contexts/NavbarContext";
import { useRepertoirePageData } from "../shared/useRepertoirePageData";
import { RepertoirePageState } from "../shared/RepertoirePageState";

const EditRepertoirePage = () => {
  const { id } = useParams();
  const { repertoire, loading, error, refetch } = useRepertoirePageData(id);

  const { setOpen } = useNavbarDispatch();
  useEffect(() => {
    setOpen(false);
  }, [setOpen]);

  if (loading) {
    return <RepertoirePageState status="loading" />;
  }

  if (error) {
    return <RepertoirePageState status="error" message={error} />;
  }

  if (!repertoire?._id) {
    return <RepertoirePageState status="notFound" />;
  }

  return (
    <RepertoireContextProvider
      repertoireId={repertoire._id}
      repertoireName={repertoire.name}
      initialMoves={repertoire.moveNodes}
      initialOrientation={repertoire.orientation ?? "white"}
      updateRepertoire={() => void refetch()}
    >
      <EditRepertoireViewContainer />
    </RepertoireContextProvider>
  );
};

export default EditRepertoirePage;
