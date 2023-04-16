import { Button } from "@mui/material";
import React from "react";
import { useBoardContext } from "./BoardContext";
import { putRepertoire } from "../../repository/repertoires/repertoires";

const BoardSaveButton = () => {

    const {repertoireId, repertoireName, moveHistory} = useBoardContext();

    const onSave = async () => {
       await putRepertoire(repertoireId, repertoireName, moveHistory.getMoveNodeWithoutParent());
    }
    
    return (
        <Button variant="contained" color="primary" onClick={onSave}>
            Save
          </Button>
    );
};

export default BoardSaveButton;