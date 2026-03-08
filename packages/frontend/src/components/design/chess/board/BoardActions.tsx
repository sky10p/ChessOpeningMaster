import React from "react";
import { ArrowPathIcon, ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Button } from "../../../ui";

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
    <div className="flex items-center gap-2">
      <Button
        intent="ghost"
        size="sm"
        className="min-h-[40px] rounded-full px-3"
        onClick={prev}
        disabled={!hasPrev()}
        aria-label="Previous move"
      >
        <ArrowLeftIcon className="h-6 w-6" />
      </Button>
      
      <Button
        intent="ghost"
        size="sm"
        className="min-h-[40px] rounded-full px-3"
        onClick={next}
        disabled={!hasNext()}
        aria-label="Next move"
      >
        <ArrowRightIcon className="h-6 w-6" />
      </Button>
      
      <Button
        intent="ghost"
        size="sm"
        className="min-h-[40px] rounded-full px-3"
        onClick={rotateBoard}
        aria-label="Rotate board"
      >
        <ArrowPathIcon className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default BoardActions;
