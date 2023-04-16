import { Move } from "chess.js";
import { Variant } from "../chess.models";

export class MoveVariantNode {
    id: string;
    move: Move | null;
    children: MoveVariantNode[];
    parent: MoveVariantNode | null;
    comment?: string;
    variantName?: string;

    constructor(){
        this.id = "initial";
        this.move = null;
        this.children = [];
        this.parent = null;
    }

    getMove(): Move {
        if(!this.move) throw new Error("Move is null");
        return this.move;
    }

    addMove(move: Move, name?: string){
        const foundChild = this.children.find(child => child.id === move.lan);
        if(foundChild){
            return foundChild;
        }
        const newNode = new MoveVariantNode();
        newNode.move = move;
        newNode.parent = this;
        newNode.id = move.lan;
        newNode.variantName = name;
        this.children.push(newNode);
        return newNode;
    }

    getVariants = (): Variant[] => {
        const variants: Variant[] = [];
        let numVariants = 0;
      
        const traverseChildren = (node: MoveVariantNode, path: MoveVariantNode[] = []) => {
          if (node.children.length === 0) {
            variants.push({ moves: [...path, node], name: node.variantName ? node.variantName : `Variant ${++numVariants}` });
          } else {
            for (const child of node.children) {
              traverseChildren(child, [...path, node]);
            }
          }
        };
      
        this.children.forEach(child => traverseChildren(child));
        return variants;
      };
      
}
 