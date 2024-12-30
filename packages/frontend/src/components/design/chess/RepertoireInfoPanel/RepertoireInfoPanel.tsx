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
      <div className="w-full h-full max-h-full overflow-hidden bg-background text-white flex flex-col">
        <div className="px-4 py-2 flex gap-2 w-full bg-background z-10">
          <UiSwitch
            label={(enabled) => (
              <StockfishLabel
                depth={depth}
                maxDepth={maxDepth}
                enabled={enabled}
              />
            )}
            enabled={stockfishEnabled}
            setEnabled={setStockfishEnabled}
          />
          <UiSwitch
            label={<PresentationChartLineIcon className="h-6 w-6" />}
            enabled={statisticsEnabled}
            setEnabled={setStatisticsEnabled}
          />
          <UiSwitch
            label={<ChatBubbleBottomCenterTextIcon className="h-6 w-6" />}
            enabled={commentEnabled}
            setEnabled={setCommentEnabled}
          />

          <RepertoireInfoActions
            actions={actions}
            moreOptionsAction={moreOptionsAction}
          />
        </div>

        {stockfishEnabled && (
          <div className="p-1 flex-1">
            <StockfishSubpanel lines={lines} fen={fen} />
          </div>
        )}
        {statisticsEnabled && (
          <div className="flex-1">
            <StatisticsSubpanel fen={fen} />
          </div>
        )}
        <div className="flex flex-col flex-1 gap-2 p-2 overflow-auto">
          <button
            className="p-2 bg-accent text-black w-full text-center"
            onClick={() => setShowSelectVariantDialog(true)}
          >
            {selectedVariant ? selectedVariant.name : "Change Variant"}
          </button>
          <div className="flex-1 overflow-auto">
            <VariantMovementsSubpanel
              moves={selectedVariant?.moves || []}
              currentMoveNode={currentMoveNode}
              goToMove={goToMove}
              deleteMove={deleteMove}
              changeNameMove={changeNameMove}
            />
          </div>
        </div>
        {commentEnabled && (
          <div className="flex-1 overflow-auto">
            <BoardComment comment={comment} updateComment={updateComment} />
          </div>
        )}
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
