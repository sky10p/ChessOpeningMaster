import React, { useEffect } from "react";
import SaveIcon from "@mui/icons-material/Save";
import { useBoardContext } from "../components/chess/BoardContext";
import { useAlertContext } from "../contexts/AlertContext";
import { putRepertoire } from "../repository/repertoires/repertoires";
import { useHeaderContext } from "../contexts/HeaderContext";

const BoardSaveButton = () => {
  const { repertoireId, repertoireName, moveHistory, orientation } =
    useBoardContext();
  const { showAlert } = useAlertContext();

  const { addIcon, removeIcon } = useHeaderContext();

  const onSave = async () => {
    try {
      showAlert("Saving repertoire...", "info");
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
  };

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
};

export default BoardSaveButton;
