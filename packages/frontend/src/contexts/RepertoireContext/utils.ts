import type { MoveVariantNode } from "../../models/VariantNode";
import type { Variant } from "../../models/chess.models";

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
