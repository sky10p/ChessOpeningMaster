import { Move } from "chess.js";
import { Variant } from "../models/chess.models";
import { IMoveNode } from "../../../../common/types/MoveNode";

export class MoveVariantNode implements IMoveNode {
 
  id: string;
  move: Move | null;
  children: MoveVariantNode[];
  parent: MoveVariantNode | null;
  comment?: string;
  variantName?: string;
  turn: number;
  position: number;

  constructor() {
    this.id = "initial";
    this.move = null;
    this.children = [];
    this.parent = null;
    this.turn = 0;
    this.position = 0;
  }

  public static initMoveVariantNode = (
    initialMoveNode: IMoveNode
  ): MoveVariantNode => {
    const moveVariantNode = new MoveVariantNode();
    
    moveVariantNode.id = initialMoveNode.id;
    moveVariantNode.move = initialMoveNode.move;
    moveVariantNode.comment = initialMoveNode.comment;
    moveVariantNode.variantName = initialMoveNode.variantName;
    this.addMoveNodesToMoveVariantNode(moveVariantNode, initialMoveNode.children);
    return moveVariantNode;
  };

  private static addMoveNodesToMoveVariantNode = (moveVariantNode: MoveVariantNode, moveNodes: IMoveNode[]) => {
    if(moveNodes.length === 0) return;
    moveNodes.forEach((moveNode) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const newNode = moveVariantNode.addMove(moveNode.move!, moveNode.variantName, moveNode.comment);
      MoveVariantNode.addMoveNodesToMoveVariantNode(newNode, moveNode.children);
    });
  }

  getUniqueKey(): string {
        return `${this.turn}. ${this.getMove().color}#${this.getMove().san}`
  }

  toString(): string {
    return `${this.turn}. ${this.getMove().color === 'b' ? "..." : ""}${this.getMove().san}`
}
  getMove(): Move {
    if (!this.move) throw new Error("Move is null");
    return this.move;
  }

  addMove(move: Move, name?: string, comment?: string) {
    const foundChild = this.children.find((child) => child.id === move.lan);
    if (foundChild) {
      return foundChild;
    }
    const newNode = new MoveVariantNode();
    newNode.move = move;
    newNode.parent = this;
    newNode.id = move.lan;
    newNode.variantName = name;
    newNode.comment = comment;
    if(this.move === null || this.move.color === "b") {
      newNode.turn = this.turn + 1;
    }else{
      newNode.turn = this.turn;
    }
    newNode.position = this.position + 1;
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

    const getDifferentNodesString = (differentNodes: MoveVariantNode[]): string => {
      if(differentNodes.length === 0) return "";
      return `(${differentNodes.map((node) => node.toString()).join(" ")})`;
    }

    const traverseChildren = (
      node: MoveVariantNode,
      path: MoveVariantNode[] = [],
      lastVariantName?: string,
      differentNodes: MoveVariantNode[] = [],
    ) => {
      if (node.children.length === 0) {
        const lastVariantNameString = `${lastVariantName} ${getDifferentNodesString(differentNodes)}`;
        variants.push({
          moves: [...path, node],
          name: node.variantName
            ? node.variantName
            : lastVariantName ? lastVariantNameString : `Variant ${++numVariants}`,
        });
      } else {
        for (const child of node.children) {
          const childVariantName = child.variantName ? child.variantName : lastVariantName;
          const currentDifferentNodes = child.variantName ? [] : differentNodes;
          const updatedDifferentNodes = node.children.length > 1 && !child.variantName ? [...currentDifferentNodes, child] : currentDifferentNodes;
         
          traverseChildren(child, [...path, node], childVariantName, updatedDifferentNodes );
        }
      }
    };

    this.children.forEach((child) => traverseChildren(child));
    return variants;
  };
}
