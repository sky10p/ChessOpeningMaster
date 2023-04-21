import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import EditRepertoireViewContainer from "./EditRepertoireViewContainer";
import { IRepertoire } from "../../../../common/types/Repertoire";
import { getRepertoire } from "../../../repository/repertoires/repertoires";
import { useNavbarContext } from "../../../contexts/NavbarContext";
import { RepertoireContextProvider } from "../../../contexts/RepertoireContext";

const EditRepertoirePage = () => {
  const { id } = useParams();
  const [repertoire, setRepertoire] = React.useState<IRepertoire | undefined>(
    undefined
  );

  useEffect(() => {
    if (id) {
      getRepertoire(id).then((repertoire) => setRepertoire(repertoire));
      
    }
  }, [id]);

  const { setOpen } = useNavbarContext();
  useEffect(() => {
    setOpen(false);
  }, []);

  return repertoire?._id ? (
    <RepertoireContextProvider
      repertoireId={repertoire._id}
      repertoireName={repertoire.name}
      initialMoves={repertoire.moveNodes}
      initialOrientation={repertoire.orientation ?? "white"}
    > 
      <EditRepertoireViewContainer />
    </RepertoireContextProvider>
  ) : (
    <div>Repertoire not found</div>
  );
};

export default EditRepertoirePage;
