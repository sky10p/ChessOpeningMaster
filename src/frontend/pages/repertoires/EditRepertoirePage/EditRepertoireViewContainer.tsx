import React, { useCallback, useEffect } from "react";
import {
  Grid,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Board from "../../../components/chess/board/Board";
import BoardActions from "../../../components/chess/board/BoardActions";
import VariantsInfo from "../../../components/chess/panels/Variants/VariantsInfo";
import { useRepertoireContext } from "../../../contexts/RepertoireContext";
import { BoardComment } from "../../../components/chess/panels/BoardComments";
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
import { toPGN } from "../../../components/chess/utils/pgn.utils";

const EditRepertoireViewContainer: React.FC = () => {
  const theme = useTheme();
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

  const calcWidth = useCallback(
    ({ screenWidth }: { screenWidth: number }): number => {
      if (screenWidth >= theme.breakpoints.values.sm) {
        return (screenWidth * 35) / 100;
      } else {
        return (screenWidth * 90) / 100;
      }
    },
    [theme.breakpoints.values.sm]
  );

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
        saveRepertory();
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
    changeIconCallback("trainRepertoire", () => {
      saveRepertory();
      navigate(`/repertoire/train/${repertoireId}`);
    });
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
    <Grid container spacing={2}>
      <Grid item container direction="column" alignItems="left" xs={12} sm={5}>
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
          <Board calcWidth={calcWidth} />
        </Grid>
        <Grid item container justifyContent="center">
          <BoardActions />
        </Grid>
      </Grid>
      <Grid item xs={12} sm={5} container direction="column" alignItems="left">
        {isMobile && panelSelected === "variants" && (
          <>
            <Grid item>
              <VariantsInfo />
            </Grid>
          </>
        )}
        {isMobile && panelSelected === "comments" && (
          <>
            <Grid item>
              <BoardComment />
            </Grid>
          </>
        )}
        {!isMobile && (
          <>
            <Grid
              item
              style={{ marginTop: "36px", height: "47%", overflowY: "auto" }}
            >
              <VariantsInfo />
            </Grid>
            <Grid item style={{ marginTop: "24px" }}>
              <BoardComment />
            </Grid>
          </>
        )}
      </Grid>
    </Grid>
  );
};

export default EditRepertoireViewContainer;
