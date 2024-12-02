import React, { useEffect, useMemo } from "react";
import { Turn } from "../../common/types/Orientation";
import { useRepertoireContext } from "./RepertoireContext";
import { MoveVariantNode } from "../models/VariantNode";
import { TrainVariant } from "../models/chess.models";
import { deepEqual } from "../utils/deepEqual";

interface TrainRepertoireContextProps {
  turn: Turn;
  isYourTurn: boolean;
  allowedMoves: MoveVariantNode[];
  finishedTrain: boolean;
  trainVariants: TrainVariant[];
  lastTrainVariant?: TrainVariant;
  chooseTrainVariantsToTrain: (trainVariants: TrainVariant[]) => void;
}

export const TrainRepertoireContext =
  React.createContext<TrainRepertoireContextProps | null>(null);

export const useTrainRepertoireContext = () => {
  const context = React.useContext(TrainRepertoireContext);

  if (!context) {
    throw new Error(
      "useTrainRepertoireContext must be used within a TrainRepertoireContextProvider"
    );
  }

  return context;
};

interface TrainRepertoireContextProviderProps {
  children: React.ReactNode;
}

const sleep = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const TrainRepertoireContextProvider: React.FC<
  TrainRepertoireContextProviderProps
> = ({ children }) => {
  const [turn, setTurn] = React.useState<Turn>("white");
  const { orientation, currentMoveNode, goToMove, initBoard, variants } =
    useRepertoireContext();
  const [allowedMoves, setAllowedMoves] = React.useState<MoveVariantNode[]>([]);
  const [trainVariants, setTrainVariants] = React.useState<TrainVariant[]>(
    variants.map((v) => ({ variant: v, state: "inProgress" }))
  );
  const [lastTrainVariant, setLastTrainVariant] =
    React.useState<TrainVariant>();

  const playOpponentMove = async () => {
    await sleep(1000);
    const randomMove = Math.floor(Math.random() * allowedMoves.length);
    goToMove(allowedMoves[randomMove]);
  };

  const chooseTrainVariantsToTrain = (trainVariants: TrainVariant[]) => {
    setTrainVariants(trainVariants);
    initBoard();
  };

  useEffect(() => {
    setTurn(currentMoveNode.move?.color === "w" ? "black" : "white");
    updateTrainVariants(currentMoveNode);
  }, [currentMoveNode]);

  useEffect(() => {
    const turnNumber = currentMoveNode.position;
    const allowedMovesFromVariants = trainVariants
      .filter((trainVariant) => {
        return trainVariant.state === "inProgress";
      })
      .map((trainVariant) => {
        return trainVariant.variant.moves[turnNumber];
      })
      .reduce((uniqueAllowedMoves, trainVariant) => {
        if (trainVariant) {
          uniqueAllowedMoves.add(trainVariant);
        }
        return uniqueAllowedMoves;
      }, new Set<MoveVariantNode>());

    const newAllowedMoves = [...allowedMovesFromVariants];
    if (!deepEqual(newAllowedMoves, allowedMoves)) {
      setAllowedMoves(newAllowedMoves);
    }
  }, [turn, trainVariants]);

  useEffect(() => {
    if (allowedMoves.length === 0) {
      initBoard();
      if (
        trainVariants.some(
          (trainVariant) =>
            trainVariant.state === "inProgress" ||
            trainVariant.state === "discarded"
        )
      ) {
        setTrainVariants(
          trainVariants.map((trainVariant) => {
            if (trainVariant.state === "discarded") {
              return { ...trainVariant, state: "inProgress" } as TrainVariant;
            }
            return trainVariant;
          })
        );
      }
    }
    if (turn != orientation && allowedMoves.length > 0) {
      playOpponentMove();
    }
  }, [allowedMoves]);

  const updateTrainVariants = (lastMove: MoveVariantNode) => {
    const newTrainVariants = trainVariants.map((trainVariant) => {
      if (
        trainVariant.state === "inProgress" &&
        lastMove.position > 0 &&
        trainVariant.variant.moves[lastMove.position - 1].id !== lastMove.id
      ) {
        return { ...trainVariant, state: "discarded" } as TrainVariant;
      }
      if (
        trainVariant.state === "inProgress" &&
        trainVariant.variant.moves.length === lastMove.position &&
        trainVariant.variant.moves[lastMove.position - 1].id === lastMove.id
      ) {
        if (lastTrainVariant?.variant.fullName !== trainVariant.variant.fullName) {
          setLastTrainVariant(trainVariant);
        }
        return { ...trainVariant, state: "finished" } as TrainVariant;
      }
      return trainVariant;
    });
    setTrainVariants(newTrainVariants);
    return newTrainVariants;
  };

  const isYourTurn = turn === orientation;

  const value = useMemo(
    () => ({
      turn,
      isYourTurn,
      allowedMoves,
      trainVariants,
      finishedTrain: trainVariants.every(
        (trainVariant) => trainVariant.state === "finished"
      ),
      lastTrainVariant,
      chooseTrainVariantsToTrain,
    }),
    [turn, isYourTurn, allowedMoves, trainVariants, lastTrainVariant]
  );

  return (
    <TrainRepertoireContext.Provider value={value}>
      {children}
    </TrainRepertoireContext.Provider>
  );
};
