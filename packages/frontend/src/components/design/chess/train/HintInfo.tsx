import React, { useState, useEffect, useCallback } from "react";
import { Chess } from "chess.js";
import { MoveVariantNode } from "../../../../models/VariantNode";
import { Textarea } from "@headlessui/react";
import { useDialogContext } from "../../../../contexts/DialogContext";
import { getPositionComment } from "../../../../repository/positions/positions";
import { BoardOrientation, getOrientationAwareFen } from "@chess-opening-master/common";

interface HintInfoProps {
  currentMoveNode: MoveVariantNode;
  orientation: BoardOrientation;
  updateComment: (comment: string) => Promise<void>;
}

const getFenForNode = (node: MoveVariantNode, orientation: BoardOrientation): string => {
  const movePath: MoveVariantNode[] = [];
  let currentNode: MoveVariantNode | null = node;

  while (currentNode && currentNode.move) {
    movePath.unshift(currentNode);
    currentNode = currentNode.parent;
  }

  const chess = new Chess();
  for (const moveNode of movePath) {
    chess.move(moveNode.getMove());
  }

  const fen = chess.fen();
  return getOrientationAwareFen(fen, orientation);
};

export const HintInfo: React.FC<HintInfoProps> = ({
  currentMoveNode,
  orientation,
  updateComment,
}) => {
  const { showTextAreaDialog } = useDialogContext();
  const [hints, setHints] = useState<string[]>([]);
  const loadHints = useCallback(async () => {
    const comments: string[] = [];
    let node = currentMoveNode;

    for (let i = 0; i < 3; i++) {
      if (node.move) {
        comments.push(node.toString());

        try {
          const positionFen = getFenForNode(node, orientation);
          const comment = await getPositionComment(positionFen);
          comments.push(comment || "No comment");
        } catch (error) {
          comments.push("No comment");
        }
      }

      if (node.parent) {
        node = node.parent;
      } else {
        break;
      }
    }
    setHints(comments);
  }, [currentMoveNode]);

  useEffect(() => {
    loadHints();
  }, [loadHints]);
  const handleUpdateComment = async () => {
    try {
      const positionFen = getFenForNode(currentMoveNode, orientation);
      const currentComment = await getPositionComment(positionFen);

      showTextAreaDialog({
        title: "Update Comment",
        contentText: `Edit comment for current position:`,
        initialValue: currentComment || "",
        rows: 6,
        onTextConfirm: async (text: string) => {
          await updateComment(text);
          await loadHints();
        },
      });
    } catch (error) {
      showTextAreaDialog({
        title: "Update Comment",
        contentText: `Edit comment for current position:`,
        initialValue: "",
        rows: 6,
        onTextConfirm: async (text: string) => {
          await updateComment(text);
          await loadHints();
        },
      });
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded shadow-md flex flex-col h-full">
      <div className="flex justify-between items-center mb-2">
        <h6 className="text-lg font-semibold">Comments</h6>
        <button
          onClick={handleUpdateComment}
          className="px-3 py-1 bg-accent text-black rounded hover:bg-accent hover:opacity-80 text-sm"
        >
          Update comment
        </button>
      </div>
      <Textarea
        className="flex-grow p-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-accent overflow-auto"
        rows={10}
        value={hints.join("\n")}
        disabled
      ></Textarea>
    </div>
  );
};
