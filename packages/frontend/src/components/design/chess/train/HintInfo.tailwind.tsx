import React from "react"
import { MoveVariantNode } from "../../../../models/VariantNode";

interface HintInfoProps {
  currentMoveNode: MoveVariantNode;
}

export const HintInfo: React.FC<HintInfoProps> = ({
  currentMoveNode
}) => {
    const getHints = (): string[] => {
      const comments: string[] = [];
      let node = currentMoveNode;
      for(let i = 0; i < 3; i++) {
        if(node.move){
          comments.push(node.toString())
          if(node.comment) {
            comments.push(node.comment);
          }else{
            comments.push("No comment")
          }
        }
        
        if(node.parent) {
          node = node.parent;
        } else {
          break;
        }
      }
      return comments;
    }
   
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h6 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
          Comments
        </h6>
        <textarea
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 resize-none"
          rows={10}
          value={getHints().join("\n")}
          disabled
        ></textarea>
      </div>
    );
}