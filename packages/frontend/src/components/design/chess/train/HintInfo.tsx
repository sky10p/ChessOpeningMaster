import React, { useState, useEffect, useCallback } from "react";
import { Chess } from "chess.js";
import { MoveVariantNode } from "../../../../models/VariantNode";
import { useDialogContext } from "../../../../contexts/DialogContext";
import { getPositionComment } from "../../../../repository/positions/positions";
import { BoardOrientation, getOrientationAwareFen } from "@chess-opening-master/common";
import { Button, Card, Textarea } from "../../../ui";

interface HintInfoProps {
  currentMoveNode: MoveVariantNode;
  orientation: BoardOrientation;
  updateComment: (comment: string) => Promise<void>;
  compact?: boolean;
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
  compact = false,
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
  }, [currentMoveNode, orientation]);

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
    <Card
      className="flex h-full w-full flex-col border-border-default bg-surface"
      padding={compact ? "compact" : "default"}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <h6
          className={
            compact
              ? "text-sm font-semibold text-text-base"
              : "text-lg font-semibold text-text-base"
          }
        >
          Comments
        </h6>
        <Button
          onClick={handleUpdateComment}
          intent="accent"
          size="sm"
        >
          Update comment
        </Button>
      </div>
      <Textarea
        className="flex-grow resize-none bg-surface-raised text-text-base"
        rows={compact ? 8 : 10}
        value={hints.join("\n")}
        disabled
      ></Textarea>
    </Card>
  );
};
