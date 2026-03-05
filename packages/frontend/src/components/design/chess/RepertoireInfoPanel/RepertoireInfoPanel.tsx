import React, { useState } from "react";
import {
  ArrowDownTrayIcon,
  Bars3BottomLeftIcon,
  ChatBubbleBottomCenterTextIcon,
  ChevronDownIcon,
  ClipboardIcon,
  ComputerDesktopIcon,
  EllipsisVerticalIcon,
  PresentationChartLineIcon,
  TrashIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import useStockfish from "../../../../libs/useStockfish";
import { StockfishSubpanel } from "./StockfishSubpanel";
import StatisticsSubpanel from "./StatisticsSubpanel";
import { VariantMovementsSubpanel } from "./VariantMovementsSubpanel";
import { MoveVariantNode } from "../../../../models/VariantNode";
import SelectVariantsDialog from "../../dialogs/SelectVariantsDialog";
import { Variant } from "../../../../models/chess.models";
import { BoardComment } from "../BoardComment";
import { RepertoireInfoActions } from "./RepertoireInfoActions/RepertoireInfoActions";
import { RepertoireInfoAction } from "./RepertoireInfoActions/model";
import { useNavigationUtils } from "../../../../utils/navigationUtils";
import { Button, TabButton, Tabs } from "../../../ui";

const NUM_LINES = 3;
type RepertoireInfoPanelMode = "moves" | "engine" | "stats" | "notes";

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
  const [activePanel, setActivePanel] = React.useState<RepertoireInfoPanelMode>("moves");
  const { lines, depth, maxDepth } = useStockfish(fen, NUM_LINES, activePanel === "engine");

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

  const panelTabs: {
    id: RepertoireInfoPanelMode;
    label: string;
    mobileLabel: string;
    icon: React.ReactElement;
  }[] = [
    {
      id: "moves",
      label: "Moves",
      mobileLabel: "Moves",
      icon: <Bars3BottomLeftIcon className="h-4 w-4" />,
    },
    {
      id: "engine",
      label: "Engine",
      mobileLabel: "Engine",
      icon: <ComputerDesktopIcon className="h-4 w-4" />,
    },
    {
      id: "stats",
      label: "Stats",
      mobileLabel: "Stats",
      icon: <PresentationChartLineIcon className="h-4 w-4" />,
    },
    {
      id: "notes",
      label: "Notes",
      mobileLabel: "Notes",
      icon: <ChatBubbleBottomCenterTextIcon className="h-4 w-4" />,
    },
  ];

  const renderPanel = () => {
    if (activePanel === "engine") {
      return (
        <div className="flex h-full min-h-0 flex-col gap-3">
          <div className="flex items-center justify-between rounded-xl border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-muted">
            <span className="font-medium text-text-base">Engine analysis</span>
            <span className="rounded-md border border-border-default bg-surface px-2 py-1 font-mono text-xs text-brand">
              {depth}/{maxDepth}
            </span>
          </div>
          <div className="min-h-0 overflow-auto">
            <StockfishSubpanel lines={lines} fen={fen} />
          </div>
        </div>
      );
    }

    if (activePanel === "stats") {
      return (
        <div className="flex h-full min-h-0 flex-col gap-3">
          <div className="rounded-xl border border-border-default bg-surface-raised px-3 py-2 text-sm font-medium text-text-base">
            Position statistics
          </div>
          <div className="min-h-0 overflow-auto">
            <StatisticsSubpanel fen={fen} />
          </div>
        </div>
      );
    }

    if (activePanel === "notes") {
      return (
        <div className="flex h-full min-h-0 flex-col gap-3">
          <div className="rounded-xl border border-border-default bg-surface-raised px-3 py-2 text-sm font-medium text-text-base">
            Position notes
          </div>
          <div className="min-h-0 overflow-auto rounded-xl border border-border-default bg-surface-raised p-3">
            <BoardComment comment={comment} updateComment={updateComment} />
          </div>
        </div>
      );
    }

    return (
      <VariantMovementsSubpanel
        moves={selectedVariant?.moves || []}
        currentMoveNode={currentMoveNode}
        goToMove={goToMove}
        deleteMove={deleteMove}
        changeNameMove={changeNameMove}
      />
    );
  };

  return (
    <>
      <div className="flex h-full max-h-full w-full flex-col overflow-hidden rounded-2xl border border-border-default bg-surface text-text-base shadow-surface">
        <div className="border-b border-border-default bg-surface-raised p-3">
          <Tabs variant="segment" className="w-full">
            {panelTabs.map((tab) => (
              <TabButton
                key={tab.id}
                variant="segment"
                active={activePanel === tab.id}
                onClick={() => setActivePanel(tab.id)}
                className="min-w-0 gap-1 px-1.5 text-xs sm:gap-1 sm:px-2 sm:text-sm xl:px-2.5"
              >
                <span className="hidden lg:inline-flex">{tab.icon}</span>
                <span className="truncate sm:hidden">{tab.mobileLabel}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </TabButton>
            ))}
          </Tabs>
          <div className="mt-3 space-y-2">
            <Button
              intent="secondary"
              size="sm"
              className="w-full justify-between rounded-lg border-border-default"
              onClick={() => setShowSelectVariantDialog(true)}
            >
              <span className="truncate">{selectedVariant ? selectedVariant.name : "Select variant"}</span>
              <ChevronDownIcon className="h-4 w-4 shrink-0" />
            </Button>
            <RepertoireInfoActions
              actions={actions}
              moreOptionsAction={moreOptionsAction}
            />
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden p-3">
          {renderPanel()}
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
