import React, { useEffect } from "react";
import SaveIcon from "@mui/icons-material/Save";
import { useRepertoireContext } from "../contexts/RepertoireContext";
import { useAlertContext } from "../contexts/AlertContext";
import { putRepertoire } from "../repository/repertoires/repertoires";
import { useHeaderContext } from "../contexts/HeaderContext";

const useSaveRepertoire = () => {
  const { repertoireId, repertoireName, moveHistory, orientation, comment } =
    useRepertoireContext();
  const { showAlert } = useAlertContext();

  const { addIcon, changeIconCallback, removeIcon } = useHeaderContext();

 
    const onSave = React.useCallback(async () => {
    try {
        showAlert("Saving repertoire...", "info");
        if(comment){
            console.log(moveHistory)
        }else{
            console.log("no comment")
        }
        await putRepertoire(
            repertoireId,
            repertoireName,
            moveHistory.getMoveNodeWithoutParent(),
            orientation
        );
        showAlert("Repertoire saved successfully.", "success");
    } catch (error) {
        showAlert("Error saving repertoire.", "error");
    }
    }, [repertoireId, repertoireName, moveHistory, orientation, comment, showAlert]);


  useEffect(() => {
    addIcon({
      key: "saveRepertoire",
      icon: <SaveIcon />,
      onClick: onSave,
    });

    return () => {
        removeIcon("saveRepertoire");
    };
  }, []);

  useEffect(()=> {
    changeIconCallback("saveRepertoire", onSave)
  }, [onSave])
};

export default useSaveRepertoire;
