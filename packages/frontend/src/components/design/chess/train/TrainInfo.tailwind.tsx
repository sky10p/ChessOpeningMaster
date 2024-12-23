import React, { useState } from "react";
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/20/solid";
import whiteKing from "../../../../assets/white-king.svg";
import blackKing from "../../../../assets/black-king.svg";
import { getMovementsFromVariant } from "../../../../utils/chess/variants/getMovementsFromVariants";
import { Turn } from "@chess-opening-master/common/src/types/Orientation";
import { TrainVariant } from "../../../../models/chess.models";
import { MoveVariantNode } from "../../../../models/VariantNode";
import { variantToPgn } from "../../../../utils/chess/pgn/pgn.utils";

interface TrainInfoProps {
  turn: Turn;
  isYourTurn: boolean;
  trainVariants: TrainVariant[];
  finishedTrain: boolean;
  lastTrainVariant: TrainVariant | undefined;
  currentMoveNode: MoveVariantNode;
}

const TrainInfo: React.FC<TrainInfoProps> = ({
  turn,
  isYourTurn,
  trainVariants,
  finishedTrain,
  lastTrainVariant,
  currentMoveNode
}) => {

  const currentVariant = trainVariants.filter(
    (variant) => variant.state === "finished"
  ).length;
  const totalVariants = trainVariants.length;

  const availableVariants = trainVariants.filter(
    (variant) => variant.state === "inProgress"
  );

  const [expandedVariant, setExpandedVariant] = useState<number | null>(null);

  const handleToggleVariant = (index: number) => {
    setExpandedVariant(expandedVariant === index ? null : index);
  };

  const handleCopyPgn = () => {
    if (lastTrainVariant) {
      const pgn = variantToPgn(lastTrainVariant.variant, turn, new Date());
      navigator.clipboard.writeText(pgn);
    }
  };

  return (
    <div className="shadow rounded-lg p-6 bg-gray-800">
      {lastTrainVariant && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-200 dark:text-gray-300">Last Finished Variant</h2>
          <div className="flex justify-between items-center mt-2">
            <span className="text-md text-gray-400 dark:text-gray-500">{lastTrainVariant.variant.fullName}</span>
            <button
              onClick={handleCopyPgn}
              className="bg-accent text-buttonText px-3 py-1 rounded hover:bg-yellow-500 transition-colors"
            >
              Copy PGN
            </button>
          </div>
        </div>
      )}
      <div className="flex items-center mb-4">
        {!finishedTrain && (
          <img
            src={turn === "white" ? whiteKing : blackKing}
            alt={`${turn} king`}
            className="w-8 h-8 mr-2"
          />
        )}
        <h3 className="text-xl font-bold text-gray-100 dark:text-gray-50">
          {finishedTrain
            ? "Finished Training"
            : isYourTurn
            ? "Your turn"
            : "Opponent's turn"}
        </h3>
      </div>
      {!finishedTrain && (
        <p className="text-gray-400 dark:text-gray-300 mb-4">
          {isYourTurn
            ? "Play one of your allowed moves according to your repertoire."
            : "Wait for your opponent to play."}
        </p>
      )}
      <div className="mb-4">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {`${currentVariant} of ${totalVariants} variants`}
        </span>
        <div className="w-full bg-gray-700 rounded-full h-2.5 dark:bg-gray-600 mt-1">
          <div
            className="bg-accent h-2.5 rounded-full"
            style={{ width: `${(currentVariant / totalVariants) * 100}%` }}
          ></div>
        </div>
      </div>
      <div>
        <h4 className="text-lg font-semibold text-gray-200 dark:text-gray-300 mb-2">
          Available Variants to Play
        </h4>
        <ul className="space-y-2">
          {availableVariants.map((variant, index) => (
            <Disclosure key={index}>
              {({ open }) => (
                <>
                  <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-left text-sm font-medium text-gray-100 dark:text-gray-200 bg-gray-700 dark:bg-gray-600 rounded-lg hover:bg-gray-600 dark:hover:bg-gray-500 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75">
                    <span>{variant.variant.fullName}</span>
                    <ChevronUpIcon
                      className={`${
                        open ? "transform rotate-180" : ""
                      } w-5 h-5 text-accent`}
                    />
                  </Disclosure.Button>
                  <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-400 dark:text-gray-300">
                    <div className="flex flex-wrap gap-2">
                      {getMovementsFromVariant(variant, currentMoveNode).map((move, moveIndex) => (
                        <span key={moveIndex} className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded">
                          {move}
                        </span>
                      ))}
                    </div>
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TrainInfo;
