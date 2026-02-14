import { Chess } from "chess.js";
import type { MoveVariantNode } from "../../models/VariantNode";
import type { Variant } from "../../models/chess.models";

export const normalizeFen = (fen: string): string => {
  const [piecePlacement = "", activeColor = "", castlingAvailability = "", enPassantTarget = ""] = fen.split(" ");
  return [piecePlacement, activeColor, castlingAvailability, enPassantTarget].join(" ");
};

export const buildFenNodeIndex = (
  variants: Variant[],
  variantName?: string | null
): Map<string, MoveVariantNode> => {
  const targetVariants = variantName
    ? variants.filter(
        (v) => v.name === variantName || v.fullName === variantName
      )
    : variants;

  const fenNodeIndex = new Map<string, MoveVariantNode>();

  for (const variant of targetVariants) {
    const tempChess = new Chess();
    for (const moveNode of variant.moves) {
      tempChess.move(moveNode.getMove());
      const normalizedFen = normalizeFen(tempChess.fen());
      if (!fenNodeIndex.has(normalizedFen)) {
        fenNodeIndex.set(normalizedFen, moveNode);
      }
    }
  }

  return fenNodeIndex;
};

export const findMoveNodeByFen = (
  variants: Variant[],
  fen: string,
  variantName?: string | null
): MoveVariantNode | null => {
  const fenNodeIndex = buildFenNodeIndex(variants, variantName);
  return fenNodeIndex.get(normalizeFen(fen)) ?? null;
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
