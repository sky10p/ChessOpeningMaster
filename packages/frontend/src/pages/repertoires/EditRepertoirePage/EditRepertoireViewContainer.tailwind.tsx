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
import LichessPanel from "../../../components/design/lichess/LichessPanel.tailwind";
import { StockfishPanel } from "../../../components/design/stockfish/StockfishPanel.tailwind";
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
  const [openPanel, setOpenPanel] = useState<FooterSection | null>("variants");

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

  const handlePanelClick = (panel: FooterSection) => {
    setOpenPanel((prevPanel) => (prevPanel === panel ? null : panel));
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
    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 bg-background text-textLight h-full">
      <div className="col-span-12 sm:col-span-4 flex flex-col items-start">
        <div className="flex justify-center w-full mb-4 mt-4">
          <h1 className="text-2xl font-bold">{repertoireName}</h1>
        </div>
        <div className="flex justify-center w-full">
          <BoardContainer />
        </div>
        <div className="flex justify-center w-full">
          <BoardActionsContainer />
        </div>
      </div>
      <div className="hidden sm:block sm:col-span-1"></div>
      <div className="col-span-12 sm:col-span-7 flex flex-col items-start overflow-auto scrollbar-custom border border-secondary rounded bg-gray-800">
        {panelSelected === "variants" && <VariantsInfo />}
        {panelSelected === "comments" && <BoardCommentContainer />}
        {panelSelected === "lichess" && <LichessPanel fen={chess.fen()} />}
        {panelSelected === "stockfish" && <StockfishPanel fen={chess.fen()} numLines={3} />}
        {/* <div className="space-y-4 w-full">
          {(["variants", "comments", "lichess", "stockfish"] as Array<FooterSection>).map((panel) => (
        <div key={panel} className="mt-6 overflow-y-auto p-4">
          <div className={`p-2 mb-2 rounded-t ${openPanel === panel ? "bg-secondary" : "bg-background"}`}>
            <h6 className={`flex items-center justify-between cursor-pointer ${openPanel === panel ? "text-textLight" : "text-textDark"}`} onClick={() => handlePanelClick(panel)}>
          {panel.charAt(0).toUpperCase() + panel.slice(1)}
          <span className={`transform transition-transform ${openPanel === panel ? "rotate-180" : "rotate-0"}`}>
            <EllipsisVerticalIcon className={`h-6 w-6 ${openPanel === panel ? "text-textLight" : "text-textDark"}`} />
          </span>
            </h6>
          </div>
          <Transition
            show={openPanel === panel}
            enter="transition-opacity duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="p-4 bg-background border border-secondary rounded-b">
          {panel === "variants" && <VariantsInfo />}
          {panel === "comments" && <BoardCommentContainer />}
          {panel === "lichess" && <LichessPanel fen={chess.fen()} />}
          {panel === "stockfish" && <StockfishPanel fen={chess.fen()} numLines={3} />}
            </div>
          </Transition>
        </div>
          ))}
        </div> */}
      </div>
    </div>
  );
};

export default EditRepertoireViewContainer;
