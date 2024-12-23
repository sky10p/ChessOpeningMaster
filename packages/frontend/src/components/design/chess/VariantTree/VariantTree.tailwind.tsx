import React, { useEffect, useMemo, useState } from "react";
import { MoveVariantNode } from "../../../../models/VariantNode";
import { Variant } from "../../../../models/chess.models";
import { SelectVariant } from "../../SelectVariant.tailwind";
import { variantToPgn } from "../../../../utils/chess/pgn/pgn.utils";
import { BoardOrientation } from "@chess-opening-master/common/src/types/Orientation";
import { VariantMovementsPanel } from "./VariantMovementsPanel.tailwind";
import VariantActionButtons from "./VariantActionButtons";

import { TrashIcon, ClipboardIcon, ArrowDownTrayIcon, ClipboardDocumentListIcon } from "@heroicons/react/24/outline";

interface VariantTreeProps {
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
}

const VariantTree: React.FC<VariantTreeProps> = ({
  variants,
  currentNode,
  orientation,
  deleteVariant,
  copyVariantToRepertoire,
  copyVariantsToRepertoire,
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
  useEffect(() => {
    setSelectedVariant(
      variants.find((variant) =>
        variant.moves.some((move) => isSelected(move))
      ) ?? variants[0]
    );
  }, [variants]);

  const downloadVariantPGN = () => {
    if (selectedVariant) {
      const pgn = variantToPgn(selectedVariant, orientation, new Date());
      const blob = new Blob([pgn], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedVariant.name}.pgn`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const copyVariantPGN = () => {
    if (selectedVariant) {
      const pgn = variantToPgn(selectedVariant, orientation, new Date());
      const textarea = document.createElement("textarea");
      textarea.value = pgn;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        console.log("Text copied to clipboard");
      } catch (err) {
        console.error("Unable to copy text", err);
      }
      document.body.removeChild(textarea);
    } else {
      console.error("No variant selected");
    }
  };

  const variantActions = useMemo(() => () => [
    {
      onClick: downloadVariantPGN,
      icon: <ArrowDownTrayIcon className="h-5 w-5 text-accent" />,
      label: "Download",
    },
    {
      onClick: copyVariantPGN,
      icon: <ClipboardIcon className="h-5 w-5 text-accent" />,
      label: "Copy",
    },
    {
      onClick: () => selectedVariant && copyVariantToRepertoire(selectedVariant),
      icon: <ClipboardDocumentListIcon className="h-5 w-5 text-accent" />,
      label: "Copy to Repertoire",
    },
    {
      onClick: copyVariantsToRepertoire,
      icon: <ClipboardIcon className="h-5 w-5 text-accent" />,
      label: "Paste Variants",
    },
    {
      onClick: () => selectedVariant && deleteVariant(selectedVariant),
      icon: <TrashIcon className="h-5 w-5 text-danger" />,
      label: "Delete",
    },
    {
      onClick: deleteVariants,
      icon: <TrashIcon className="h-5 w-5 text-danger" />,
      label: "Delete All",
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
            <SelectVariant
              variants={variants}
              selectedVariant={selectedVariant}
              onSelectVariant={setSelectedVariant}
            />
          </div>
        )}
        <div>
          {/* <Movements moves={selectedVariant?.moves} /> */}
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
    </div>
  );
};

export default VariantTree;
