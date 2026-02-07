import { Chess } from "chess.js";
import type { MoveVariantNode } from "../../models/VariantNode";
import type { Variant } from "../../models/chess.models";

export const normalizeFen = (fen: string): string => {
  return fen.split(" ").slice(0, 4).join(" ");
};

export const findMoveNodeByFen = (
  variants: Variant[],
  fen: string,
  variantName?: string | null
): MoveVariantNode | null => {
  const targetVariants = variantName
    ? variants.filter(
        (v) => v.name === variantName || v.fullName === variantName
      )
    : variants;

  const normalizedTarget = normalizeFen(fen);

  for (const variant of targetVariants) {
    const tempChess = new Chess();
    for (const moveNode of variant.moves) {
      tempChess.move(moveNode.getMove());
      if (normalizeFen(tempChess.fen()) === normalizedTarget) {
        return moveNode;
      }
    }
  }

  return null;
};

export const isVariantCompatibleWithNode = (
  variant: Variant,
  node: MoveVariantNode
) => {
  if (variant.moves.length < node.position) return false;
  let currentNode: MoveVariantNode | null = node;
  let index = node.position - 1;
  while (currentNode && currentNode.parent) {
    if (variant.moves[index]?.id !== currentNode.id) return false;
    currentNode = currentNode.parent;
    index -= 1;
  }
  return true;
};
