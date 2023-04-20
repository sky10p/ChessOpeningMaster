import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IRepertoire } from "../../../../common/types/Repertoire";
import { getRepertoire } from "../../../repository/repertoires/repertoires";
import { useNavbarContext } from "../../../contexts/NavbarContext";
import { useHeaderContext } from "../../../contexts/HeaderContext";
import { RepertoireContextProvider } from "../../../contexts/RepertoireContext";
import EditRepertoireViewContainer from "../EditRepertoirePage/EditRepertoireViewContainer";
import EditIcon from '@mui/icons-material/Edit';
import TrainRepertoireViewContainer from "./TrainRepertoireViewContainer";

const TrainRepertoirePage = () => {
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
        key: "goToEditRepertoire",
        icon: <EditIcon />,
        onClick: () => {
          navigate(`/repertoire/${id}`);
        },
      });
    }
    return () => {
      removeIcon("goToEditRepertoire");
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
      <TrainRepertoireViewContainer />
    </RepertoireContextProvider>
  ) : (
    <div>Repertoire not found</div>
  );
};

export default TrainRepertoirePage;
