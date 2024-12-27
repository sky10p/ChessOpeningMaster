import React, { useEffect, useMemo, useState } from "react";
import { MoveVariantNode } from "../../../../models/VariantNode";
import { Variant } from "../../../../models/chess.models";
import { BoardOrientation } from "@chess-opening-master/common/src/types/Orientation";
import { VariantMovementsPanel } from "./VariantMovementsPanel";
import VariantActionButtons from "./VariantActionButtons";
import SelectVariantsDialog from "../../dialogs/SelectVariantsDialog";

import { TrashIcon, ClipboardIcon, ArrowDownTrayIcon, ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { TrashListIcon } from "../../../icons/TrashListIcon";

interface VariantTreeProps {
  variants: Variant[];
  currentNode: MoveVariantNode;
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
}

const VariantTree: React.FC<VariantTreeProps> = ({
  variants,
  currentNode,
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
}) => {
  const isSelected = (node: MoveVariantNode) => node === currentNode;
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



  const variantActions = useMemo(() => () => [
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
      onClick: () => selectedVariant && copyVariantToRepertoire(selectedVariant),
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
  ], [selectedVariant, copyVariantToRepertoire, copyVariantsToRepertoire, deleteVariant, deleteVariants, downloadVariantPGN]);

  return (
    <div className="w-full text-textLight">
      {selectedVariant && (
        <div className="flex justify-center">
          <VariantActionButtons actions={variantActions()} />
        </div>
      )}
      <div>
        {selectedVariant && (
          <div className="grid grid-cols-1">
            <button
              onClick={() => setShowSelectVariantDialog(true)}
              className="px-4 py-2 bg-accent text-black rounded hover:opacity-75"
            >
              {selectedVariant ? selectedVariant.name : "Change Variant"}
            </button>
          </div>
        )}
        <div>
          {selectedVariant?.moves && (
            <VariantMovementsPanel
              moves={selectedVariant?.moves}
              changeNameMove={changeNameMove}
              currentMoveNode={currentMoveNode}
              deleteMove={deleteMove}
              goToMove={goToMove}
              maxHeight="300px"
            />
          )}
        </div>
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
    </div>
  );
};

export default VariantTree;
