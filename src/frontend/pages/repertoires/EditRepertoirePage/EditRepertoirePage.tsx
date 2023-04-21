import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EditRepertoireViewContainer from "./EditRepertoireViewContainer";
import { IRepertoire } from "../../../../common/types/Repertoire";
import { getRepertoire } from "../../../repository/repertoires/repertoires";
import { useNavbarContext } from "../../../contexts/NavbarContext";
import { useHeaderContext } from "../../../contexts/HeaderContext";
import PlayLessonIcon from "@mui/icons-material/PlayLesson";
import { RepertoireContextProvider } from "../../../contexts/RepertoireContext";

const EditRepertoirePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
          navigate(`/repertoire/train/${id}`);
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