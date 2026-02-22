import React, { useState } from "react";
import UiSwitch from "../../../basic/UiSwitch";
import {
  ArrowDownTrayIcon,
  ChatBubbleBottomCenterTextIcon,
  ClipboardIcon,
  EllipsisVerticalIcon,
  PresentationChartLineIcon,
  TrashIcon,
  AcademicCapIcon,
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
import { useNavigationUtils } from "../../../../utils/navigationUtils";

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
  setSelectedVariant: (variant: Variant | null) => void;
  comment: string;
  updateComment: (comment: string) => Promise<void>;
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
  const { goToTrainRepertoire } = useNavigationUtils();

  const [showSelectVariantDialog, setShowSelectVariantDialog] = useState(false);

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
      onClick: () => selectedVariant && goToTrainRepertoire(repertoireId, selectedVariant.fullName),
      icon: <AcademicCapIcon className="h-5 w-5 text-accent" />,
      label: "Train",
    },
    {
      onClick: () => selectedVariant && downloadVariantPGN(selectedVariant),
      icon: <ArrowDownTrayIcon className="h-5 w-5 text-accent" />,
      label: "Download",
    },
    {
      onClick: () => selectedVariant && copyVariantPGN(selectedVariant),
      icon: <ClipboardIcon className="h-5 w-5 text-accent" />,
      label: "Copy PGN",
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
      <div className="w-full h-full max-h-full overflow-hidden bg-surface text-text-base flex flex-col rounded-lg shadow-surface border border-border-default">
        {/* Header con controles y acciones */}
        <div className="px-4 py-3 flex items-center justify-between w-full bg-surface-raised z-10 border-b border-border-default rounded-t-lg">
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
                  <PresentationChartLineIcon className="h-5 w-5 text-brand" />
                  <span className="ml-1 text-sm font-medium hidden sm:inline">
                    Stats
                  </span>
                </div>
              }
              enabled={statisticsEnabled}
              setEnabled={setStatisticsEnabled}
            />
            <UiSwitch
              label={
                <div className="flex items-center">
                  <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-success" />
                  <span className="ml-1 text-sm font-medium hidden sm:inline">
                    Notes
                  </span>
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
              className="m-3 py-2 px-4 bg-brand hover:opacity-90 text-text-on-brand font-medium rounded-md transition-all duration-200 shadow-surface hover:shadow-elevated flex items-center justify-center gap-2"
              onClick={() => setShowSelectVariantDialog(true)}
            >
              <span>
                {selectedVariant ? selectedVariant.name : "Select Variant"}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
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
            <div className="p-3 border-t border-border-default bg-surface">
              <h3 className="text-sm font-medium text-text-muted mb-2">
                Engine Analysis
              </h3>
              <StockfishSubpanel lines={lines} fen={fen} />
            </div>
          )}

          {statisticsEnabled && (
            <div className="p-3 border-t border-border-default bg-surface">
              <h3 className="text-sm font-medium text-text-muted mb-2">
                Statistical Analysis
              </h3>
              <StatisticsSubpanel fen={fen} />
            </div>
          )}

          {commentEnabled && (
            <div className="p-3 border-t border-border-default bg-surface">
              <h3 className="text-sm font-medium text-text-muted mb-2">
                Position Notes
              </h3>
              <BoardComment comment={comment} updateComment={updateComment} />
            </div>
          )}
        </div>
      </div>
      <SelectVariantsDialog
        open={showSelectVariantDialog}
        multiple={false}
        title="Select Variant"
        contentText="Choose a single variant from current position"
        variants={variants}
        repertoireId={repertoireId}
        currentMoveNode={currentMoveNode}
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
