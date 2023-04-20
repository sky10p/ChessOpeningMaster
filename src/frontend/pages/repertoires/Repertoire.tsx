import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import RepertoireViewContainer from "../../components/chess/repertoires/RepertoireViewContainer";
import { IRepertoire } from "../../../common/types/Repertoire";
import { getRepertoire } from "../../repository/repertoires/repertoires";
import { useNavbarContext } from "../../contexts/NavbarContext";
import { useHeaderContext } from "../../contexts/HeaderContext";
import PlayLessonIcon from "@mui/icons-material/PlayLesson";
import { BoardContextProvider } from "../../contexts/RepertoireContext";

const Repertoire = () => {
  const { id } = useParams();
  const [repertoire, setRepertoire] = React.useState<IRepertoire | undefined>(
    undefined
  );
  const { addIcon, removeIcon } = useHeaderContext();

  useEffect(() => {
    if (id) {
      getRepertoire(id).then((repertoire) => setRepertoire(repertoire));
      addIcon({
        key: "trainRepertoire",
        icon: <PlayLessonIcon />,
        onClick: () => {
          console.log("train repertoire" + id);
        },
      });
    }
    return () => {
      removeIcon("trainRepertoire");
    };
  }, [id]);

  const { setOpen } = useNavbarContext();
  useEffect(() => {
    setOpen(false);
  }, []);

  return repertoire?._id ? (
    <BoardContextProvider
      repertoireId={repertoire._id}
      repertoireName={repertoire.name}
      initialMoves={repertoire.moveNodes}
      initialOrientation={repertoire.orientation ?? "white"}
    > 
      <RepertoireViewContainer />
    </BoardContextProvider>
  ) : (
    <div>Repertoire not found</div>
  );
};

export default Repertoire;
