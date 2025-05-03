import React from "react";
import { MoveVariantNode } from "../../../../models/VariantNode";
import { Textarea } from "@headlessui/react";
import { useDialogContext } from "../../../../contexts/DialogContext";

interface HintInfoProps {
  currentMoveNode: MoveVariantNode;
  updateComment: (comment: string) => void;
}

export const HintInfo: React.FC<HintInfoProps> = ({
  currentMoveNode,
  updateComment,
}) => {
  const { showTextAreaDialog } = useDialogContext();

  const getHints = (): string[] => {
    const comments: string[] = [];
    let node = currentMoveNode;
    for (let i = 0; i < 3; i++) {
      if (node.move) {
        comments.push(node.toString());
        if (node.comment) {
          comments.push(node.comment);
        } else {
          comments.push("No comment");
        }
      }

      if (node.parent) {
        node = node.parent;
      } else {
        break;
      }
    }
    return comments;
  };

  const handleUpdateComment = () => {
    showTextAreaDialog({
      title: "Update Comment",
      contentText: `Edit comment for move ${currentMoveNode.toString()}:`,
      initialValue: currentMoveNode.comment || "",
      rows: 6,
      onTextConfirm: (text: string) => {
        updateComment(text);
      },
    });
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
        value={getHints().join("\n")}
        disabled
      ></Textarea>
    </div>
  );
};
