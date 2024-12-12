import React, { useEffect } from "react";
import {
  Box,
  Grid,
  Theme,
  Typography,
  useMediaQuery,
} from "@mui/material";
import BoardContainer from "../../../components/application/chess/board/BoardContainer";
import BoardActionsContainer from "../../../components/application/chess/board/BoardActionsContainer";
import VariantsInfo from "../../../components/application/chess/board/VariantsInfo";
import { useRepertoireContext } from "../../../contexts/RepertoireContext";
import { BoardCommentContainer } from "../../../components/application/chess/board/BoardCommentContainer";
import { useFooterContext } from "../../../contexts/FooterContext";

import ChatIcon from "@mui/icons-material/Chat";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import SaveIcon from "@mui/icons-material/Save";
import PlayLessonIcon from "@mui/icons-material/PlayLesson";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import { useHeaderContext } from "../../../contexts/HeaderContext";
import { useNavigate } from "react-router-dom";
import { useMenuContext } from "../../../contexts/MenuContext";
import { API_URL } from "../../../repository/constants";

const EditRepertoireViewContainer: React.FC = () => {
  const navigate = useNavigate();

  const [panelSelected, setPanelSelected] = React.useState<
    "variants" | "comments"
  >("variants");

  const { repertoireId, repertoireName, saveRepertory, getPgn } =
    useRepertoireContext();

  const { showMenu } = useMenuContext();

  const {
    addIcon: addIconHeader,
    removeIcon: removeIconHeader,
    changeIconCallback,
  } = useHeaderContext();
  const {
    addIcon: addIconFooter,
    removeIcon: removeIconFooter,
    setIsVisible,
  } = useFooterContext();

  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("sm")
  );

  const showMenuHeader = (event: React.MouseEvent<HTMLElement>) => {
    showMenu((event.currentTarget) || null, [
      {
        name: "Download PGN",
        action: () => {
          const pgn = getPgn();
          const blob = new Blob([pgn], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.download = `${repertoireName}.pgn`;
          link.href = url;
          link.click();
        },
      },
      {
        name: "Download JSON",
        action: () => {
          window.open(`${API_URL}/repertoires/${repertoireId}/download`);
        },
      },
    ])
  }

  useEffect(() => {
    
    addIconHeader({
      key: "trainRepertoire",
      icon: <PlayLessonIcon />,
      onClick: () => {
           navigate(`/repertoire/train/${repertoireId}`);
      },
    }),
      addIconHeader({
        key: "saveRepertoire",
        icon: <SaveIcon />,
        onClick: saveRepertory,
      });
    addIconHeader({
      key: "moreOptions",
      icon: <MoreVertIcon />,
      onClick: showMenuHeader,
    });

    return () => {
      removeIconHeader("trainRepertoire");
      removeIconHeader("saveRepertoire");
      removeIconHeader("moreOptions");
    };
  }, []);

  useEffect(() => {
    changeIconCallback("saveRepertoire", saveRepertory);
  }, [saveRepertory]);

  useEffect(() => {
    changeIconCallback("moreOptions", (event: React.MouseEvent<HTMLElement>) => {
      showMenuHeader(event);
    });
  }, [getPgn]);

  useEffect(() => {
    if (isMobile) {
      setIsVisible(true);
      addIconFooter({
        key: "variants",
        label: "Variants",
        icon: <AccountTreeIcon />,
        onClick: () => setPanelSelected("variants"),
      });
      addIconFooter({
        key: "comments",
        label: "Comments",
        icon: <ChatIcon />,
        onClick: () => setPanelSelected("comments"),
      });
    }

    return () => {
      setIsVisible(false);
      removeIconFooter("variants");
      removeIconFooter("comments");
    };
  }, [isMobile]);

  return (
    <Grid container spacing={2} >
      <Grid item container direction="column" alignItems="left" xs={12} sm={4} >
        <Grid item container justifyContent={"center"}>
          <Typography
            variant="h5"
            gutterBottom
            style={{ marginBottom: "16px" }}
          >
            {repertoireName}
          </Typography>
        </Grid>
        <Grid item container justifyContent={"center"}>
          <BoardContainer />
        </Grid>
        <Grid item container justifyContent="center">
          <BoardActionsContainer />
        </Grid>
      </Grid>
      <Grid item xs={12} sm={7} container direction="column" alignItems="left" display={"flex"} overflow={"auto"} >
        {isMobile && panelSelected === "variants" && (
      

              <VariantsInfo />
   
      
        )}
        {isMobile && panelSelected === "comments" && (
 
           
              <BoardCommentContainer />
       
       
        )}
        {!isMobile && (
          <>
            <Box style={{ marginTop: "36px", overflowY: "auto" }}>
              <VariantsInfo />
            </Box>
            <Box style={{ marginTop: "24px", overflowY: "auto" }}>
              <BoardCommentContainer />
            </Box>
          </>
        )}
      </Grid>
    </Grid>
  );
};

export default EditRepertoireViewContainer;
