import { BoardOrientation } from "react-chessboard/dist/chessboard/types";
import { MoveVariantNode } from "../../../models/VariantNode";
import { Variant } from "../../../models/chess.models";

export const toPGN = (
  nameRepertoire: string,
  date: Date,
  orientation: BoardOrientation,
  tree: MoveVariantNode
): string => {
  const header = `[Event "${nameRepertoire}"]
[Site "https://chessrepertoire.com"]
[Date "${date.toISOString().split("T")[0].replace(/-/g, ".")}"]
[Round "?"]
[White "${orientation === "white" ? nameRepertoire : "?"}"]
[Black "${orientation === "black" ? nameRepertoire : "?"}"]
[Result "*"]
[Variant "Standard"]
[Opening "${nameRepertoire}"]
[Annotator "ChessOpeningMaster"]

`;

  const movesPgn = addNodeToPgn( tree, true);

  return [header + movesPgn, "*"].join(" ");
};

export const variantToPgn = (
  variant: Variant,
  orientation: BoardOrientation,
  date: Date
): string => {
  const header = `[Event "${variant.fullName}"]
[Site "https://chessrepertoire.com"]
[Date "${date.toISOString().split("T")[0].replace(/-/g, ".")}"]
[Round "?"]
[White "${orientation === "white" ? variant.fullName : "?"}"]
[Black "${orientation === "black" ? variant.fullName : "?"}"]
[Result "*"]
[Variant "Standard"]
[Opening "${variant.fullName}"]
[Annotator "ChessOpeningMaster"]

`;

  const movesPgn = variant.moves.map((move, index) => {
    const moveString = move.getMove().color === "w" ? `${Math.floor(index / 2) + 1}. ${move.getMove().san}` : `${Math.floor(index / 2) + 1}... ${move.getMove().san}`;
    const comments = move.comment && move.comment !== "" ? `{${move.comment}}` : "";
    return [moveString, comments].filter(text => text !== "").join(" ");
  }).join(" ");

  return [header + movesPgn, "*"].join(" ");
}

export const addNodeToPgn = (
  node: MoveVariantNode,
  isMainVariant: boolean
): string => {
  if (node.children.length === 0) return "";

  const firstChildNode = node.children[0];
  const restNodes = node.children.slice(1);

  const moveString =
    firstChildNode.getMove().color === "w"
      ? `${firstChildNode.turn}. ${firstChildNode.getMove().san}`
      : isMainVariant ? firstChildNode.getMove().san : `${firstChildNode.turn}... ${firstChildNode.getMove().san}`;

   const comments = firstChildNode.comment && firstChildNode.comment !== "" ? `{${firstChildNode.comment}}` : "";
   const moveWithComments = [moveString, comments].filter(text => text !== "").join(" ");

    const newPgn = [moveWithComments, addSubVariantsToPgn(restNodes), addNodeToPgn(firstChildNode, restNodes.length > 0 ? false : true)].filter(text => text !== "").join(" ");
    return newPgn;
};

export const addSubVariantsToPgn = (nodes: MoveVariantNode[]): string => {
    if(nodes.length === 0) return "";

    const firstNode = nodes[0];
    const restNodes = nodes.slice(1);

    const firstVariantString = `(${addNodeToPgn({...firstNode, children: [firstNode]} as MoveVariantNode, false)})`;
    const restVariantsString = addSubVariantsToPgn(restNodes);

    return [firstVariantString, restVariantsString].filter(text => text !== "").join(" ");

};

