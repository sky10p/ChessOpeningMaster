import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRepertoireContext } from "../../../contexts/RepertoireContext";
import { useHeaderDispatch } from "../../../contexts/HeaderContext";
import { useMenuContext } from "../../../contexts/MenuContext";
import { downloadRepertoireJson } from "../../../repository/repertoires/repertoires";
import BoardContainer from "../../../components/application/chess/board/BoardContainer";
import BoardActionsContainer from "../../../components/application/chess/board/BoardActionsContainer";
import {
  EllipsisVerticalIcon,
  BookOpenIcon,
  ChatBubbleBottomCenterTextIcon,
  ComputerDesktopIcon,
  PresentationChartLineIcon,
} from "@heroicons/react/24/outline";
import SaveIcon from "../../../components/icons/SaveIcon";
import VariantsIcon from "../../../components/icons/VariantsIcon";
import { BoardCommentContainer } from "../../../components/application/chess/board/BoardCommentContainer";
import VariantsInfo from "../../../components/application/chess/board/VariantsInfo";
import StatisticsPanel from "../../../components/design/statistics/StatisticsPanel";
import { StockfishPanel } from "../../../components/design/stockfish/StockfishPanel";
import { RepertoireInfo } from "../../../components/application/chess/board/RepertoireInfo";
import { useFooterDispatch } from "../../../contexts/FooterContext";
import { useKeyboardNavigation } from "../../../hooks/useKeyboardNavigation";
import { RepertoireWorkspaceLayout } from "../shared/RepertoireWorkspaceLayout";
import { useAlertContext } from "../../../contexts/AlertContext";

type FooterSection = "variants" | "comments" | "statistics" | "stockfish";

const EditRepertoireViewContainer: React.FC = () => {
  const navigate = useNavigate();
  const [panelSelected, setPanelSelected] = useState<FooterSection>("variants");

  const { 
    repertoireId, 
    repertoireName, 
    saveRepertory, 
    getPgn, 
    chess,
    next,
    nextFollowingVariant,
    prev,
    hasNext,
    hasPrev,
    selectedVariant,
  } = useRepertoireContext();
  
  const { toggleMenu } = useMenuContext();
  const { showAlert } = useAlertContext();
  const { addIcon: addIconHeader, removeIcon: removeIconHeader } =
    useHeaderDispatch();
  const {
    addIcon: addIconFooter,
    removeIcon: removeIconFooter,
    setIsVisible,
  } = useFooterDispatch();

  useKeyboardNavigation({
    next,
    nextFollowingVariant,
    prev,
    hasNext,
    hasPrev,
    selectedVariant,
  });

  const toggleMenuHeader = (event: React.MouseEvent<HTMLElement>) => {
    toggleMenu(event.currentTarget || null, [
      {
        name: "Download PGN",
        action: async () => {
          const pgn = await getPgn();
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
        action: async () => {
          try {
            await downloadRepertoireJson(repertoireId, repertoireName);
          } catch {
            showAlert("Unable to download repertoire for current user.", "error");
          }
        },
      },
    ]);
  };

  useEffect(() => {
    addIconHeader({
      key: "trainRepertoire",
      icon: <BookOpenIcon />,
      onClick: () => {
        navigate(`/repertoire/train/${repertoireId}`);
      },
    });
    addIconHeader({
      key: "saveRepertoire",
      icon: <SaveIcon />,
      onClick: saveRepertory,
    });
    addIconHeader({
      key: "moreOptions",
      icon: <EllipsisVerticalIcon />,
      onClick: toggleMenuHeader,
    });

    return () => {
      removeIconHeader("trainRepertoire");
      removeIconHeader("saveRepertoire");
      removeIconHeader("moreOptions");
    };
  }, [navigate, repertoireId, saveRepertory, getPgn, toggleMenu]);

  useEffect(() => {
    setIsVisible(true);
    addIconFooter({
      key: "variants",
      label: "Variants",
      icon: <VariantsIcon className="h-6 w-6" />,
      onClick: () => setPanelSelected("variants"),
    });
    addIconFooter({
      key: "comments",
      label: "Comments",
      icon: <ChatBubbleBottomCenterTextIcon className="h-6 w-6" />,
      onClick: () => setPanelSelected("comments"),
    });
    addIconFooter({
      key: "statistics",
      label: "Statistics",
      icon: <PresentationChartLineIcon className="h-6 w-6" />,
      onClick: () => setPanelSelected("statistics"),
    });
    addIconFooter({
      key: "stockfish",
      label: "Stockfish",
      icon: <ComputerDesktopIcon className="h-6 w-6" />,
      onClick: () => setPanelSelected("stockfish"),
    });

    return () => {
      setIsVisible(false);
      removeIconFooter("variants");
      removeIconFooter("comments");
      removeIconFooter("statistics");
      removeIconFooter("stockfish");
    };
  }, []);

  return (
    <RepertoireWorkspaceLayout
      title={repertoireName}
      board={<BoardContainer />}
      boardActions={<BoardActionsContainer />}
      mobilePanel={
        <>
          {panelSelected === "variants" && <VariantsInfo />}
          {panelSelected === "comments" && <BoardCommentContainer />}
          {panelSelected === "statistics" && <StatisticsPanel fen={chess.fen()} />}
          {panelSelected === "stockfish" && (
            <StockfishPanel fen={chess.fen()} numLines={3} />
          )}
        </>
      }
      desktopPanel={<RepertoireInfo />}
    />
  );
};

export default EditRepertoireViewContainer;
