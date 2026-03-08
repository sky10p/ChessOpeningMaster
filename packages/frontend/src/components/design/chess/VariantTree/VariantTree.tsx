import React, { useMemo, useState } from "react";
import { MoveVariantNode } from "../../../../models/VariantNode";
import { Variant } from "../../../../models/chess.models";
import { VariantMovementsPanel } from "./VariantMovementsPanel";
import VariantActionButtons from "./VariantActionButtons";
import SelectVariantsDialog from "../../dialogs/SelectVariantsDialog";
import { Badge, Button, IconButton } from "../../../ui";
import { cn } from "../../../../utils/cn";

import {
  TrashIcon,
  ClipboardIcon,
  ArrowDownTrayIcon,
  ClipboardDocumentListIcon,
  AcademicCapIcon,
  ChevronDownIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import { TrashListIcon } from "../../../icons/TrashListIcon";
import { BoardOrientation } from "@chess-opening-master/common";
import { useNavigationUtils } from "../../../../utils/navigationUtils";
import { MenuContext } from "../../../../contexts/MenuContext";

interface VariantTreeProps {
  variants: Variant[];
  repertoireId: string;
  orientation: BoardOrientation;
  deleteVariant: (variant: Variant) => void;
  copyVariantToRepertoire: (variant: Variant) => void;
  downloadVariantPGN: (variant: Variant) => void;
  copyVariantPGN: (variant: Variant) => void;
  deleteVariants: () => void;
  copyVariantsToRepertoire: () => void;
  changeNameMove: (move: MoveVariantNode, newName: string) => void;
  deleteMove: (move: MoveVariantNode) => void;
  goToMove: (move: MoveVariantNode) => void;
  currentMoveNode: MoveVariantNode;
  selectedVariant: Variant | null;
  setSelectedVariant: (variant: Variant | null) => void;
  compact?: boolean;
  mobileEditorMode?: boolean;
}

const VariantTree: React.FC<VariantTreeProps> = ({
  variants,
  repertoireId,
  deleteVariant,
  copyVariantToRepertoire,
  copyVariantsToRepertoire,
  downloadVariantPGN,
  copyVariantPGN,
  deleteVariants,
  changeNameMove,
  deleteMove,
  goToMove,
  currentMoveNode,
  selectedVariant,
  setSelectedVariant,
  compact = false,
  mobileEditorMode = false,
}) => {
  const { goToTrainRepertoire } = useNavigationUtils();
  const menuContext = React.useContext(MenuContext);
  const [showSelectVariantDialog, setShowSelectVariantDialog] = useState(false);
  const moveCount = selectedVariant?.moves.length ?? 0;
  const activeMoveLabel = currentMoveNode.move?.san ?? "Start position";
  const turnCount = Math.ceil(moveCount / 2);
  const openVariantMenu = (target: HTMLElement, variant: Variant) => {
    menuContext?.toggleMenu(target, [
      {
        name: "Train variant",
        action: () => goToTrainRepertoire(repertoireId, variant.fullName),
      },
      {
        name: "Download",
        action: () => downloadVariantPGN(variant),
      },
      {
        name: "Copy PGN",
        action: () => copyVariantPGN(variant),
      },
      {
        name: "Copy variant to repertoire",
        action: () => copyVariantToRepertoire(variant),
      },
      {
        name: "Copy variants to repertoire",
        action: copyVariantsToRepertoire,
      },
      {
        name: "Delete variant",
        action: () => deleteVariant(variant),
      },
      {
        name: "Delete variants",
        action: deleteVariants,
      },
    ]);
  };

  const variantActions = useMemo(
    () => () =>
      [
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
          onClick: () =>
            selectedVariant && copyVariantToRepertoire(selectedVariant),
          icon: <ClipboardIcon className="h-5 w-5 text-accent" />,
          label: "Copy variant",
        },
        {
          onClick: copyVariantsToRepertoire,
          icon: <ClipboardDocumentListIcon className="h-5 w-5 text-accent" />,
          label: "Copy variants",
        },
        {
          onClick: () => selectedVariant && deleteVariant(selectedVariant),
          icon: <TrashIcon className="h-5 w-5 text-danger" />,
          label: "Delete variant",
        },
        {
          onClick: deleteVariants,
          icon: <TrashListIcon className="h-5 w-5 text-danger" />,
          label: "Delete variants",
        },
      ],
    [
      selectedVariant,
      copyVariantToRepertoire,
      copyVariantsToRepertoire,
      deleteVariant,
      deleteVariants,
      downloadVariantPGN,
      copyVariantPGN,
      goToTrainRepertoire,
      repertoireId,
    ]
  );

  return (
    <div className="w-full min-w-0 overflow-x-hidden text-text-base">
      <div className={cn("space-y-3", mobileEditorMode && "space-y-2")}>
        {selectedVariant ? (
          <div
            className={cn(
              "rounded-xl border border-border-default",
              mobileEditorMode ? "bg-surface px-2.5 py-2.5" : "bg-surface-raised p-3"
            )}
          >
            {!compact && <VariantActionButtons actions={variantActions()} />}
            {mobileEditorMode && compact ? (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-subtle">Current line</p>
                  <Badge variant="default" size="sm">
                    {turnCount} turns
                  </Badge>
                  <Badge variant="info" size="sm">
                    Active {activeMoveLabel}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setShowSelectVariantDialog(true)}
                    intent="secondary"
                    size="sm"
                    className="min-w-0 flex-1 justify-between rounded-lg px-2"
                  >
                    <span className="truncate text-left">{selectedVariant.fullName}</span>
                    <ChevronDownIcon className="h-4 w-4 shrink-0" />
                  </Button>
                  <IconButton
                    label="More variant actions"
                    onClick={(event) => openVariantMenu(event.currentTarget, selectedVariant)}
                    className="h-9 w-9 shrink-0 border border-border-default bg-surface text-text-muted hover:bg-interactive hover:text-text-base"
                  >
                    <EllipsisVerticalIcon className="h-5 w-5" />
                  </IconButton>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {compact ? (
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-subtle">Current line</p>
                ) : null}
                <Button
                  onClick={() => setShowSelectVariantDialog(true)}
                  intent="secondary"
                  size="sm"
                  className="w-full justify-between rounded-xl"
                >
                  <span className="truncate text-left">{selectedVariant.name}</span>
                  <ChevronDownIcon className="h-4 w-4 shrink-0" />
                </Button>
                {compact ? (
                  <div className="flex items-center gap-2">
                    <Button
                      intent="accent"
                      size="sm"
                      className="flex-1"
                      onClick={() => goToTrainRepertoire(repertoireId, selectedVariant.fullName)}
                    >
                      <AcademicCapIcon className="h-4 w-4" />
                      Train
                    </Button>
                    <IconButton
                      label="More variant actions"
                      onClick={(event) => openVariantMenu(event.currentTarget, selectedVariant)}
                      className="border border-border-default bg-surface text-text-muted hover:bg-interactive hover:text-text-base"
                    >
                      <EllipsisVerticalIcon className="h-5 w-5" />
                    </IconButton>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        ) : null}
        <div>
          {selectedVariant?.moves ? (
            <VariantMovementsPanel
              moves={selectedVariant.moves}
              changeNameMove={changeNameMove}
              currentMoveNode={currentMoveNode}
              deleteMove={deleteMove}
              goToMove={goToMove}
              maxHeight={mobileEditorMode ? "min(42vh, 20rem)" : compact ? undefined : "300px"}
              mobileMode={mobileEditorMode}
            />
          ) : (
            <div className="rounded-xl border border-border-default bg-surface-raised p-4 text-sm text-text-subtle">
              No movements available for this variant.
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
    </div>
  );
};

export default VariantTree;
