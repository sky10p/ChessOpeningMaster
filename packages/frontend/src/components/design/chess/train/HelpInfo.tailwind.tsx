import React, { useEffect, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import { MoveVariantNode } from "../../../../models/VariantNode";
import { MoveNodeButtonWithActions } from "../../../application/chess/board/MoveNodeButtonWithActions";

interface HelpInfoProps {
  allowedMoves: MoveVariantNode[];
  isYourTurn: boolean;
}

const HelpInfo: React.FC<HelpInfoProps> = ({
  allowedMoves,
  isYourTurn,
}) => {
  const [iconVisible, setIconVisible] = useState(true);

  useEffect(() => {
    if (!isYourTurn) {
      setIconVisible(true);
    }
  }, [isYourTurn]);

  const toggleVisibility = () => {
    setIconVisible(!iconVisible);
  };

  return (
    <div className="mb-4 p-4 rounded-lg shadow">
      <div className="flex items-center justify-center space-x-2 mb-4">
        <button
          onClick={toggleVisibility}
          className="p-2 bg-accent text-buttonText rounded-full hover:bg-yellow-500 transition-colors focus:outline-none"
          aria-label="Toggle Available Moves"
        >
          {iconVisible ? (
            <ChevronUpIcon className="w-5 h-5" />
          ) : (
            <ChevronDownIcon className="w-5 h-5" />
          )}
        </button>
        <span className="text-base font-bold text-gray-200 dark:text-gray-300">
          Available Moves
        </span>
      </div>
      {!iconVisible && isYourTurn && (
        <div className="flex flex-wrap justify-center gap-2">
          {allowedMoves.map((move, index) => (
            <MoveNodeButtonWithActions key={index} move={move} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HelpInfo;