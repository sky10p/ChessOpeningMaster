import { Move } from "chess.js";
import { Variant } from "../chess.models";
import { IMoveNode } from "../../../../common/types/MoveNode";

export class MoveVariantNode implements IMoveNode {
 
  id: string;
  move: Move | null;
  children: MoveVariantNode[];
  parent: MoveVariantNode | null;
  comment?: string;
  variantName?: string;
  turn: number;

  constructor() {
    this.id = "initial";
    this.move = null;
    this.children = [];
    this.parent = null;
    this.turn = 0;
  }

  public static initMoveVariantNode = (
    initialMoveNode: IMoveNode
  ): MoveVariantNode => {
    const moveVariantNode = new MoveVariantNode();
    moveVariantNode.id = initialMoveNode.id;
    moveVariantNode.move = initialMoveNode.move;
    moveVariantNode.comment = initialMoveNode.comment;
    moveVariantNode.variantName = initialMoveNode.variantName;
    moveVariantNode.children = initialMoveNode.children.map((child) => {
      const newNode = MoveVariantNode.initMoveVariantNode(child);
      newNode.parent = moveVariantNode;
      return newNode;
    });
    return moveVariantNode;
  };

  getUniqueKey(): string {
        return `${this.turn}. ${this.getMove().color}#${this.getMove().san}`
  }
  getMove(): Move {
    if (!this.move) throw new Error("Move is null");
    return this.move;
  }

  addMove(move: Move, name?: string) {
    const foundChild = this.children.find((child) => child.id === move.lan);
    if (foundChild) {
      return foundChild;
    }
    const newNode = new MoveVariantNode();
    newNode.move = move;
    newNode.parent = this;
    newNode.id = move.lan;
    newNode.variantName = name;
    if(this.move === null || this.move.color === "b") {
      newNode.turn = this.turn + 1;
    }else{
      newNode.turn = this.turn;
    }
    this.children.push(newNode);
    return newNode;
  }

  getMoveNodeWithoutParent(): IMoveNode {
    return {
      id: this.id,
      move: this.move,
      comment: this.comment,
      variantName: this.variantName,
      children: this.children.map((child) => child.getMoveNodeWithoutParent()),
    };
  }


  getVariants = (): Variant[] => {
    const variants: Variant[] = [];
    let numVariants = 0;

    const traverseChildren = (
      node: MoveVariantNode,
      path: MoveVariantNode[] = []
    ) => {
      if (node.children.length === 0) {
        variants.push({
          moves: [...path, node],
          name: node.variantName
            ? node.variantName
            : `Variant ${++numVariants}`,
        });
      } else {
        for (const child of node.children) {
          traverseChildren(child, [...path, node]);
        }
      }
    };

    this.children.forEach((child) => traverseChildren(child));
    return variants;
  };
}
