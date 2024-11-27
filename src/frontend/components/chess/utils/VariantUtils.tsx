import { Variant } from "../models/chess.models";
import { MoveVariantNode } from "./VariantNode";

export const variantsToMoves = (variants: Variant[]): MoveVariantNode => {
    const rootNode = new MoveVariantNode();
    for (const variant of variants) {
        let currentMove = rootNode;
        for (const move of variant.moves) {
            const foundMove = currentMove.children.find((node) => node === move);
            if (!foundMove) {
                const newMove = move;
                newMove.children = [];
                currentMove.children.push(newMove);
                currentMove = newMove;
            } else {
                currentMove = foundMove;
            }
        }
    }
    return rootNode;
}