import React, { useEffect, useState } from "react";
import UiSwitch from "../../../basic/UiSwitch";
import {
  ArrowDownTrayIcon,
  ChatBubbleBottomCenterTextIcon,
  ClipboardIcon,
  EllipsisVerticalIcon,
  PresentationChartLineIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import useStockfish from "../../../../libs/useStockfish";
import { StockfishSubpanel } from "./StockfishSubpanel";
import { StockfishLabel } from "./StockfishLabel";
import StatisticsSubpanel from "./StatisticsSubpanel";
import { VariantMovementsSubpanel } from "./VariantMovementsSubpanel";
import { MoveVariantNode } from "../../../../models/VariantNode";
import SelectVariantsDialog from "../../dialogs/SelectVariantsDialog";
import { Variant } from "../../../../models/chess.models";
import { BoardComment } from "../BoardComment";
import { RepertoireInfoActions } from "./RepertoireInfoActions/RepertoireInfoActions";
import { RepertoireInfoAction } from "./RepertoireInfoActions/model";

const NUM_LINES = 3;

interface RepertoireInfoPanelProps {
  repertoireId: string;
  variants: Variant[];
  fen: string;
  currentMoveNode: MoveVariantNode;
  goToMove: (move: MoveVariantNode) => void;
  deleteMove: (move: MoveVariantNode) => void;
  changeNameMove: (move: MoveVariantNode, newName: string) => void;
  selectedVariant: Variant;
  setSelectedVariant: (variant: Variant) => void;
  comment: string;
  updateComment: (comment: string) => void;
  downloadVariantPGN: (variant: Variant) => void;
  copyVariantPGN: (variant: Variant) => void;
  copyVariantToRepertoire: (variant: Variant) => void;
  copyVariantsToRepertoire: () => void;
  deleteVariants: () => void;
  deleteVariant: (variant: Variant) => void;
  toggleMenu: (
    anchorEl: HTMLElement | null,
    items: { name: string; action: () => void }[]
  ) => void;
}

export const RepertoireInfoPanel: React.FC<RepertoireInfoPanelProps> = ({
  fen,
  currentMoveNode,
  goToMove,
  deleteMove,
  changeNameMove,
  repertoireId,
  variants,
  comment,
  selectedVariant,
  setSelectedVariant,
  updateComment,
  copyVariantPGN,
  copyVariantToRepertoire,
  copyVariantsToRepertoire,
  deleteVariants,
  downloadVariantPGN,
  deleteVariant,
  toggleMenu,
}) => {
  const isSelected = (node: MoveVariantNode) => node === currentMoveNode;

  const [showSelectVariantDialog, setShowSelectVariantDialog] = useState(false);
  useEffect(() => {
    setSelectedVariant(
      variants.find((variant) =>
        variant.moves.some((move) => isSelected(move))
      ) ?? variants[0]
    );
  }, [variants]);
  const [stockfishEnabled, setStockfishEnabled] = React.useState(false);
  const [statisticsEnabled, setStatisticsEnabled] = React.useState(false);
  const [commentEnabled, setCommentEnabled] = React.useState(false);
  const { lines, depth, maxDepth } = useStockfish(
    fen,
    NUM_LINES,
    stockfishEnabled
  );

  const actions = [
    {
      onClick: () => selectedVariant && downloadVariantPGN(selectedVariant),
      icon: <ArrowDownTrayIcon className="h-5 w-5 text-accent" />,
      label: "Download",
    },
    {
      onClick: () => selectedVariant && copyVariantPGN(selectedVariant),
      icon: <ClipboardIcon className="h-5 w-5 text-accent" />,
      label: "Copy",
    },
    {
      onClick: () => selectedVariant && deleteVariant(selectedVariant),
      icon: <TrashIcon className="h-5 w-5 text-danger" />,
      label: "Delete variant",
    },
  ];

  const secondaryActions = [
    {
      name: "Copy variant to repertoire",
      action: () => selectedVariant && copyVariantToRepertoire(selectedVariant),
    },
    {
      name: "Copy variants to repertoire",
      action: copyVariantsToRepertoire,
    },
    {
      name: "Delete variants",
      action: deleteVariants,
    },
  ];

  const moreOptionsAction: RepertoireInfoAction = {
    label: "More options",
    icon: <EllipsisVerticalIcon className="h-5 w-5 text-accent" />,
    onClick: (event) => {
      toggleMenu(event.currentTarget, secondaryActions);
    },
  };

  return (
    <>
      <div className="w-full h-full max-h-full overflow-hidden bg-slate-800 text-white flex flex-col rounded-lg shadow-lg border border-slate-700">
        {/* Header con controles y acciones */}
        <div className="px-4 py-3 flex items-center justify-between w-full bg-gradient-to-r from-slate-800 to-slate-700 z-10 border-b border-slate-600 rounded-t-lg">
          <div className="flex items-center gap-3">
            <UiSwitch
              label={(enabled) => (
                <div className="flex items-center">
                  <StockfishLabel
                    depth={depth}
                    maxDepth={maxDepth}
                    enabled={enabled}
                  />
                </div>
              )}
              enabled={stockfishEnabled}
              setEnabled={setStockfishEnabled}
            />
            <UiSwitch
              label={
                <div className="flex items-center">
                  <PresentationChartLineIcon className="h-5 w-5 text-blue-400" />
                  <span className="ml-1 text-sm font-medium hidden sm:inline">Stats</span>
                </div>
              }
              enabled={statisticsEnabled}
              setEnabled={setStatisticsEnabled}
            />
            <UiSwitch
              label={
                <div className="flex items-center">
                  <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-green-400" />
                  <span className="ml-1 text-sm font-medium hidden sm:inline">Notes</span>
                </div>
              }
              enabled={commentEnabled}
              setEnabled={setCommentEnabled}
            />
          </div>

          <RepertoireInfoActions
            actions={actions}
            moreOptionsAction={moreOptionsAction}
          />
        </div>

        {/* Contenido principal con paneles condicionales */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Panel de variante siempre visible */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <button
              className="m-3 py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-md transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              onClick={() => setShowSelectVariantDialog(true)}
            >
              <span>{selectedVariant ? selectedVariant.name : "Select Variant"}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div className="flex-1 overflow-auto px-2">
              <VariantMovementsSubpanel
                moves={selectedVariant?.moves || []}
                currentMoveNode={currentMoveNode}
                goToMove={goToMove}
                deleteMove={deleteMove}
                changeNameMove={changeNameMove}
              />
            </div>
          </div>

          {/* Paneles condicionales */}
          {stockfishEnabled && (
            <div className="p-3 border-t border-slate-700 bg-slate-800">
              <h3 className="text-sm font-medium text-slate-300 mb-2">Engine Analysis</h3>
              <StockfishSubpanel lines={lines} fen={fen} />
            </div>
          )}
          
          {statisticsEnabled && (
            <div className="p-3 border-t border-slate-700 bg-slate-800">
              <h3 className="text-sm font-medium text-slate-300 mb-2">Statistical Analysis</h3>
              <StatisticsSubpanel fen={fen} />
            </div>
          )}
          
          {commentEnabled && (
            <div className="p-3 border-t border-slate-700 bg-slate-800">
              <h3 className="text-sm font-medium text-slate-300 mb-2">Position Notes</h3>
              <BoardComment comment={comment} updateComment={updateComment} />
            </div>
          )}
        </div>
      </div>
      <SelectVariantsDialog
        open={showSelectVariantDialog}
        multiple={false}
        title="Select Variant"
        contentText="Choose a single variant"
        variants={variants}
        repertoireId={repertoireId}
        onConfirm={(selected) => {
          if (selected.length > 0) {
            setSelectedVariant(selected[0]);
          }
          setShowSelectVariantDialog(false);
        }}
        onClose={() => setShowSelectVariantDialog(false)}
      />
    </>
  );
};
