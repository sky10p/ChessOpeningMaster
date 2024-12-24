import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRepertoireContext } from "../../../contexts/RepertoireContext";
import { useFooterContext } from "../../../contexts/FooterContext";
import { useHeaderContext } from "../../../contexts/HeaderContext";
import { useMenuContext } from "../../../contexts/MenuContext";
import { API_URL } from "../../../repository/constants";
import BoardContainer from "../../../components/application/chess/board/BoardContainer";
import BoardActionsContainer from "../../../components/application/chess/board/BoardActionsContainer";
import VariantsInfo from "../../../components/application/chess/board/VariantsInfo";
import { BoardCommentContainer } from "../../../components/application/chess/board/BoardCommentContainer";
import LichessPanel from "../../../components/design/lichess/LichessPanel";
import { StockfishPanel } from "../../../components/design/stockfish/StockfishPanel";
import { ComputerDesktopIcon, EllipsisVerticalIcon, ChatBubbleBottomCenterTextIcon, PresentationChartLineIcon, BookOpenIcon } from "@heroicons/react/24/outline";
import SaveIcon from "../../../components/icons/SaveIcon";
import VariantsIcon from "../../../components/icons/VariantsIcon";

type FooterSection = "variants" | "comments" | "lichess" | "stockfish";

const EditRepertoireViewContainer: React.FC = () => {
  const navigate = useNavigate();
  const [panelSelected, setPanelSelected] = useState<FooterSection>("variants");
  const { repertoireId, repertoireName, saveRepertory, getPgn, chess } = useRepertoireContext();
  const { showMenu } = useMenuContext();
  const { addIcon: addIconHeader, removeIcon: removeIconHeader, changeIconCallback } = useHeaderContext();
  const { addIcon: addIconFooter, removeIcon: removeIconFooter, setIsVisible } = useFooterContext();

  const showMenuHeader = (event: React.MouseEvent<HTMLElement>) => {
    showMenu(event.currentTarget || null, [
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
      key: "lichess",
      label: "Lichess",
      icon: <PresentationChartLineIcon className="h-6 w-6" />,
      onClick: () => setPanelSelected("lichess"),
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
      removeIconFooter("lichess");
      removeIconFooter("stockfish");
    };
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-12 w-full gap-4 bg-background text-textLight h-full">
      <div className="col-span-12 sm:col-span-6  flex flex-col justify-center items-center">
        <div className="flex justify-center w-full p-1 sm:p-4">
          <h1 className="text-base sm:text-2xl font-bold">{repertoireName}</h1>
        </div>
        <div className="flex justify-center w-full sm:p-4 lg:max-h-[60vh] lg:max-w-[60vh]">
          <BoardContainer />
        </div>
        <div className="flex justify-center w-full p-1 sm:p-4">
          <BoardActionsContainer />
        </div>
      </div>
      
      <div className="col-span-12 sm:col-span-6 flex flex-col items-start overflow-auto scrollbar-custom border border-secondary rounded bg-gray-800">
        {panelSelected === "variants" && <VariantsInfo />}
        {panelSelected === "comments" && <BoardCommentContainer />}
        {panelSelected === "lichess" && <LichessPanel fen={chess.fen()} />}
        {panelSelected === "stockfish" && <StockfishPanel fen={chess.fen()} numLines={3} />}
  
      </div>
    </div>
  );
};

export default EditRepertoireViewContainer;
