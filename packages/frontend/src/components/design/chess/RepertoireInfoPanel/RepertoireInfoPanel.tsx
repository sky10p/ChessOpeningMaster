import React, { useEffect, useState } from "react";
import UiSwitch from "../../../basic/UiSwitch";
import {
  ChatBubbleBottomCenterTextIcon,
  PresentationChartLineIcon,
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

const NUM_LINES = 3;

interface RepertoireInfoPanelProps {
  variants: Variant[];
  fen: string;
  currentMoveNode: MoveVariantNode;
  goToMove: (move: MoveVariantNode) => void;
  deleteMove: (move: MoveVariantNode) => void;
  changeNameMove: (move: MoveVariantNode, newName: string) => void;
  onSelectVariant: () => void;
  comment: string;
  updateComment: (comment: string) => void;
}

/* interface VariantTreeProps {
  variants: Variant[];
  currentNode: MoveVariantNode;
  orientation: BoardOrientation;
  deleteVariant: (variant: Variant) => void;
  copyVariantToRepertoire: (variant: Variant) => void;
  deleteVariants: () => void;
  copyVariantsToRepertoire: () => void;
  changeNameMove: (move: MoveVariantNode, newName: string) => void;
  deleteMove: (move: MoveVariantNode) => void;
  goToMove: (move: MoveVariantNode) => void;
  currentMoveNode: MoveVariantNode;
} */

export const RepertoireInfoPanel: React.FC<RepertoireInfoPanelProps> = ({
  fen,
  currentMoveNode,
  goToMove,
  deleteMove,
  changeNameMove,
  variants,
  comment,
  updateComment,
}) => {
  const isSelected = (node: MoveVariantNode) => node === currentMoveNode;
  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>(
    variants[0]
  );
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

  return (
    <>
      <div className="w-full h-full overflow-y-auto bg-background text-white flex flex-col">
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
        </div>

        {stockfishEnabled && (
          <div className="p-1">
            <StockfishSubpanel lines={lines} fen={fen} />
          </div>
        )}
        {statisticsEnabled && <StatisticsSubpanel fen={fen} />}
        <button
          className="p-2 bg-accent text-black w-full text-center"
          onClick={() => setShowSelectVariantDialog(true)}
        >
          {selectedVariant ? selectedVariant.name : "Change Variant"}
        </button>
        <div
          className="overflow-y-auto flex-1"
        >
          <VariantMovementsSubpanel
            moves={selectedVariant?.moves || []}
            currentMoveNode={currentMoveNode}
            goToMove={goToMove}
            deleteMove={deleteMove}
            changeNameMove={changeNameMove}
          />
        </div>
        {commentEnabled && (
          <div className="overflow-auto flex-1">
            <BoardComment
              comment={comment}
              updateComment={updateComment}
              editable={true}
            />
          </div>
        )}
      </div>
      <SelectVariantsDialog
        open={showSelectVariantDialog}
        multiple={false}
        title="Select Variant"
        contentText="Choose a single variant"
        variants={variants}
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
