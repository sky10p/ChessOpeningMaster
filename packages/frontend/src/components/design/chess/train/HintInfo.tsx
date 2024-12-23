import React from "react"
import { MoveVariantNode } from "../../../../models/VariantNode";
import { Textarea } from "@headlessui/react";

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
      <div className="p-4 bg-gray-800 rounded shadow-md flex flex-col h-full">
        <h6 className="text-lg font-semibold mb-2">
          Comments
        </h6>
        <Textarea
          className="flex-grow p-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-accent overflow-auto"
          rows={10}
          value={getHints().join("\n")}
          disabled
        ></Textarea>
      </div>
    );
}