import React from "react";
import { ArrowPathIcon, ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

interface BoardActionsProps {
  next: () => void;
  prev: () => void;
  hasNext: () => boolean;
  hasPrev: () => boolean;
  rotateBoard: () => void;
}

const BoardActions: React.FC<BoardActionsProps> = ({
  next,
  prev,
  hasNext,
  hasPrev,
  rotateBoard,
}) => {
  return (
    <div className="flex justify-center items-center mt-1">
      <button
        className="text-textLight disabled:opacity-50"
        onClick={prev}
        disabled={!hasPrev()}
        title="Previous move"
      >
        <ArrowLeftIcon className="h-6 w-6" />
      </button>
      
      <button
        className="text-textLight disabled:opacity-50 mx-2"
        onClick={next}
        disabled={!hasNext()}
        title="Next move"
      >
        <ArrowRightIcon className="h-6 w-6" />
      </button>
      
      <button 
        className="text-textLight" 
        onClick={rotateBoard}
        title="Rotate board"
      >
        <ArrowPathIcon className="h-6 w-6" />
      </button>
    </div>
  );
};

export default BoardActions;
