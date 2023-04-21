import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { IRepertoire } from "../../../../common/types/Repertoire";
import { getRepertoire } from "../../../repository/repertoires/repertoires";
import { useNavbarContext } from "../../../contexts/NavbarContext";
import { RepertoireContextProvider } from "../../../contexts/RepertoireContext";
import TrainRepertoireViewContainer from "./TrainRepertoireViewContainer";
import { TrainRepertoireContextProvider } from "../../../contexts/TrainRepertoireContext";

const TrainRepertoirePage = () => {
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
      {" "}
      <TrainRepertoireContextProvider>
        <TrainRepertoireViewContainer />
      </TrainRepertoireContextProvider>
    </RepertoireContextProvider>
  ) : (
    <div>Repertoire not found</div>
  );
};

export default TrainRepertoirePage;
