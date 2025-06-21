import { BoardOrientation } from "react-chessboard/dist/chessboard/types";
import { MoveVariantNode } from "../../../models/VariantNode";
import { Chess } from "chess.js";
import { Variant } from "@chess-opening-master/common";
import { getCommentsByFens } from "../../../repository/positions/positions";


const collectFens = (node: MoveVariantNode, chess: Chess, fens: Set<string>) => {
  if (node.children.length === 0) return;
  for (const child of node.children) {
    chess.move(child.getMove().san);
    fens.add(chess.fen());
    collectFens(child, chess, fens);
    chess.undo();
  }
};

export const toPGN = async (
  nameRepertoire: string,
  date: Date,
  orientation: BoardOrientation,
  tree: MoveVariantNode
): Promise<string> => {
  const whiteTag = orientation === "white" ? nameRepertoire : "?";
  const blackTag = orientation === "black" ? nameRepertoire : "?";
  const header = `[Event "${nameRepertoire}"]
[Site "https://chessrepertoire.com"]
[Date "${date.toISOString().split("T")[0].replace(/-/g, ".")}"]
[Round "?"]
[White "${whiteTag}"]
[Black "${blackTag}"]
[Result "*"]
[Variant "Standard"]
[Opening "${nameRepertoire}"]
[Annotator "ChessKeep"]

`;
  const chess = new Chess();
  const fens = new Set<string>();
  collectFens(tree, new Chess(), fens);
  const commentsMap = await getCommentsByFens(Array.from(fens));
  const movesPgn = await addNodeToPgn(tree, true, chess, commentsMap);
  return [header + movesPgn, "*"].join(" ");
};

export const addNodeToPgn = async (
  node: MoveVariantNode,
  isMainVariant: boolean,
  chess: Chess,
  commentsMap: Record<string, string>
): Promise<string> => {
  if (node.children.length === 0) return "";
  const firstChildNode = node.children[0];
  const restNodes = node.children.slice(1);
  chess.move(firstChildNode.getMove().san);
  const fen = chess.fen();
  const comment = commentsMap[fen] || "";
  const moveString =
    firstChildNode.getMove().color === "w"
      ? `${firstChildNode.turn}. ${firstChildNode.getMove().san}`
      : isMainVariant
      ? firstChildNode.getMove().san
      : `${firstChildNode.turn}... ${firstChildNode.getMove().san}`;
  const comments = comment !== "" ? `{${comment}}` : "";
  const moveWithComments = [moveString, comments].filter(text => text !== "").join(" ");
  const subVariants = await addSubVariantsToPgn(restNodes, chess, commentsMap);
  const nextMoves = await addNodeToPgn(firstChildNode, restNodes.length > 0 ? false : true, chess, commentsMap);
  return [moveWithComments, subVariants, nextMoves].filter(text => text !== "").join(" ");
};

export const addSubVariantsToPgn = async (nodes: MoveVariantNode[], chess: Chess, commentsMap: Record<string, string>): Promise<string> => {
  if (nodes.length === 0) return "";
  const firstNode = nodes[0];
  const restNodes = nodes.slice(1);
  const chessCopy = new Chess();
  chessCopy.load(chess.fen());
  const firstVariantString = `(${await addNodeToPgn({ ...firstNode, children: [firstNode] } as MoveVariantNode, false, chessCopy, commentsMap)})`;
  const restVariantsString = await addSubVariantsToPgn(restNodes, chess, commentsMap);
  return [firstVariantString, restVariantsString].filter(text => text !== "").join(" ");
};

const collectFensVariant = (variant: Variant, chess: Chess, fens: Set<string>) => {
  for (let i = 0; i < variant.moves.length; i++) {
    const move = variant.moves[i];
    if (move.move) chess.move(move.move.san);
    fens.add(chess.fen());
  }
};

export const variantToPgn = async (
  variant: Variant,
  orientation: BoardOrientation,
  date: Date
): Promise<string> => {
  const whiteTag = orientation === "white" ? variant.fullName : "?";
  const blackTag = orientation === "black" ? variant.fullName : "?";
  const header = `[Event "${variant.fullName}"]
[Site "https://chessrepertoire.com"]
[Date "${date.toISOString().split("T")[0].replace(/-/g, ".")}"]
[Round "?"]
[White "${whiteTag}"]
[Black "${blackTag}"]
[Result "*"]
[Variant "Standard"]
[Opening "${variant.fullName}"]
[Annotator "ChessKeep"]

`;
  const chess = new Chess();
  const fens = new Set<string>();
  collectFensVariant(variant, new Chess(), fens);
  const commentsMap = await getCommentsByFens(Array.from(fens));
  let movesPgn = "";
  for (let i = 0; i < variant.moves.length; i++) {
    const move = variant.moves[i];
    if (move.move) chess.move(move.move.san);
    const fen = chess.fen();
    const comment = commentsMap[fen] || "";
    const moveString = move.move && move.move.color === "w"
      ? `${Math.floor(i / 2) + 1}. ${move.move.san}`
      : `${Math.floor(i / 2) + 1}... ${move.move ? move.move.san : ""}`;
    const comments = comment !== "" ? `{${comment}}` : "";
    movesPgn += [moveString, comments].filter(text => text !== "").join(" ") + " ";
  }
  return [header + movesPgn.trim(), "*"].join(" ");
};

