import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Theme,
  Typography,
  useMediaQuery,
  Collapse,
  IconButton,
  Paper,
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import ComputerIcon from "@mui/icons-material/Computer";

import { useHeaderContext } from "../../../contexts/HeaderContext";
import { useNavigate } from "react-router-dom";
import { useMenuContext } from "../../../contexts/MenuContext";
import { API_URL } from "../../../repository/constants";
import LichessPanel from "../../../components/design/lichess/LichessPanel";
import { StockfishPanel } from "../../../components/design/stockfish/StockfishPanel";

type FooterSection = "variants" | "comments" | "lichess" | "stockfish";


const EditRepertoireViewContainer: React.FC = () => {
  const navigate = useNavigate();

  const [panelSelected, setPanelSelected] = React.useState<FooterSection>("variants");

  const { repertoireId, repertoireName, saveRepertory, getPgn, chess } =
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

  const [openPanel, setOpenPanel] = useState<FooterSection | null>("variants");

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

  const handlePanelClick = (panel: FooterSection) => {
    setOpenPanel((prevPanel) => (prevPanel === panel ? null : panel));
  };

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
      addIconFooter({
        key: "lichess",
        label: "Lichess",
        icon: <SportsEsportsIcon />,
        onClick: () => setPanelSelected("lichess"),
      });
      addIconFooter({
        key: "stockfish",
        label: "Stockfish",
        icon: <ComputerIcon />,
        onClick: () => setPanelSelected("stockfish"),
      });
    }

    return () => {
      setIsVisible(false);
      removeIconFooter("variants");
      removeIconFooter("comments");
      removeIconFooter("lichess");
      removeIconFooter("stockfish");
    };
  }, [isMobile]);
  

  return (
    <Grid container spacing={2} >
      <Grid item container direction="column" alignItems="left" xs={12} sm={4} >
        <Grid item container justifyContent={"center"} spacing={2} sx={{ marginBottom: '1rem', marginTop: '1rem' }}>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ marginBottom: '1rem', color: 'primary.main' }}
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
      <Grid item xs={false} sm={1} />
      <Grid item xs={12} sm={7} container direction="column" alignItems="left" display={"flex"} overflow={"auto"}>
        {isMobile && panelSelected === "variants" && (
          <VariantsInfo />
        )}
        {isMobile && panelSelected === "comments" && (
          <BoardCommentContainer />
        )}
        {isMobile && panelSelected === "lichess" && (
          <LichessPanel fen={chess.fen()} />
        )}
        {isMobile && panelSelected === "stockfish" && (
          <StockfishPanel fen={chess.fen()} numLines={3} />
        )}
        {!isMobile && (
          <>
            {(["variants", "comments", "lichess", "stockfish"] as Array<FooterSection>).map((panel) => (
              <Box key={panel} style={{ marginTop: "1.5rem", overflowY: "auto", padding: "1rem" }}>
                <Paper style={{ backgroundColor: openPanel === panel ? "#333" : "#f5f5f5", padding: "0.5rem", marginBottom: "0.5rem", borderRadius: openPanel === panel ? "0.5rem 0.5rem 0 0" : "0.5rem" }}>
                  <Typography variant="h6" onClick={() => handlePanelClick(panel)} sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: openPanel === panel ? "#fff" : "#000" }}>
                    {panel.charAt(0).toUpperCase() + panel.slice(1)}
                    <IconButton>
                      <ExpandMoreIcon sx={{ transform: openPanel === panel ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", color: openPanel === panel ? "#fff" : "#000" }} />
                    </IconButton>
                  </Typography>
                </Paper>
                <Collapse in={openPanel === panel} timeout="auto" unmountOnExit>
                  <Box style={{ padding: "1rem", backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "0 0 0.5rem 0.5rem" }}>
                    {panel === "variants" && <VariantsInfo />}
                    {panel === "comments" && <BoardCommentContainer />}
                    {panel === "lichess" && <LichessPanel fen={chess.fen()} />}
                    {panel === "stockfish" && <StockfishPanel fen={chess.fen()} numLines={3}/>}
                  </Box>
                </Collapse>
              </Box>
            ))}
          </>
        )}
      </Grid>
    </Grid>
  );
};

export default EditRepertoireViewContainer;
