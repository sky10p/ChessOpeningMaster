import { Variant } from '../models/chess.models';
import { MoveVariantNode } from '@chess-opening-master/common';

export const getVariantsFromCurrentPosition = (currentNode: MoveVariantNode, allVariants: Variant[]): Variant[] => {
  if (currentNode.position === 0) {
    return allVariants;
  }
  
  const currentPath: string[] = [];
  let node = currentNode;
  while (node.parent !== null) {
    currentPath.unshift(node.id);
    node = node.parent;
  }
  
  return allVariants.filter(variant => {
    if (variant.moves.length < currentPath.length) {
      return false;
    }
    
    for (let i = 0; i < currentPath.length; i++) {
      if (variant.moves[i].id !== currentPath[i]) {
        return false;
      }
    }
    
    return true;
  });
};
