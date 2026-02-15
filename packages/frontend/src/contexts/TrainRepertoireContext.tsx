import React, { useEffect, useMemo } from "react";
import { useRepertoireContext } from "./RepertoireContext";
import { MoveVariantNode } from "../models/VariantNode";
import { TrainVariant } from "../models/chess.models";
import { deepEqual } from "../utils/deepEqual";
import { saveVariantReview } from "../repository/repertoires/trainVariants";
import { ReviewRating, Turn } from "@chess-opening-master/common";
import { useLocation } from "react-router-dom";
import { suggestReviewRating } from "../utils/chess/spacedRepetition/reviewRating";

export type PendingVariantReview = {
  variantName: string;
  openingName: string;
  startingFen: string;
  wrongMoves: number;
  ignoredWrongMoves: number;
  hintsUsed: number;
  timeSpentSec: number;
  suggestedRating: ReviewRating;
};

interface TrainRepertoireContextProps {
  turn: Turn;
  isYourTurn: boolean;
  allowedMoves: MoveVariantNode[];
  finishedTrain: boolean;
  trainVariants: TrainVariant[];
  lastTrainVariant?: TrainVariant;
  chooseTrainVariantsToTrain: (trainVariants: TrainVariant[]) => void;
  lastErrors: number;
  setLastErrors: (errors: number) => void;
  lastIgnoredErrors: number;
  setLastIgnoredErrors: (errors: number) => void;
  pendingVariantReview: PendingVariantReview | null;
  submitPendingVariantReview: (rating: ReviewRating) => Promise<void>;
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
  const {
    repertoireId,
    orientation,
    chess,
    currentMoveNode,
    goToMove,
    initBoard,
    variants,
  } = useRepertoireContext();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const variantName = params.get("variantName") || undefined;
  const variantNamesParam = params.get("variantNames") || undefined;
  const variantNames = variantNamesParam
    ? new Set(variantNamesParam.split("|").filter(Boolean))
    : undefined;
  const defaultTrainVariants: TrainVariant[] = variants
    .filter((v) => {
      if (variantNames && variantNames.size > 0) {
        return variantNames.has(v.fullName) || variantNames.has(v.name);
      }
      return !variantName || v.fullName === variantName || v.name === variantName;
    })
    .map((v) => ({
      variant: v,
      state: "inProgress",
    }));
  const [allowedMoves, setAllowedMoves] = React.useState<MoveVariantNode[]>([]);
  const [trainVariants, setTrainVariants] =
    React.useState<TrainVariant[]>(defaultTrainVariants);
  const [lastTrainVariant, setLastTrainVariant] =
    React.useState<TrainVariant>();
  const [lastErrors, setLastErrors] = React.useState<number>(0);
  const [lastIgnoredErrors, setLastIgnoredErrors] = React.useState<number>(0);
  const [pendingReviews, setPendingReviews] = React.useState<PendingVariantReview[]>([]);
  const [variantStartTimes, setVariantStartTimes] = React.useState<Record<string, number>>(
    () =>
      Object.fromEntries(
        defaultTrainVariants.map((trainVariant) => [
          trainVariant.variant.fullName,
          Date.now(),
        ])
      )
  );

  const playOpponentMove = async () => {
    await sleep(1000);
    const randomMove = Math.floor(Math.random() * allowedMoves.length);
    goToMove(allowedMoves[randomMove]);
  };

  const chooseTrainVariantsToTrain = (selectedTrainVariants: TrainVariant[]) => {
    const nowMs = Date.now();
    setTrainVariants(selectedTrainVariants);
    setVariantStartTimes(
      Object.fromEntries(
        selectedTrainVariants.map((trainVariant) => [
          trainVariant.variant.fullName,
          nowMs,
        ])
      )
    );
    setPendingReviews([]);
    setLastErrors(0);
    setLastIgnoredErrors(0);
    initBoard();
  };

  const submitPendingVariantReview = async (rating: ReviewRating) => {
    const pendingReview = pendingReviews[0];
    if (!pendingReview) {
      return;
    }
    await saveVariantReview(repertoireId, {
      variantName: pendingReview.variantName,
      openingName: pendingReview.openingName,
      startingFen: pendingReview.startingFen,
      rating,
      suggestedRating: pendingReview.suggestedRating,
      acceptedSuggested: rating === pendingReview.suggestedRating,
      wrongMoves: pendingReview.wrongMoves,
      ignoredWrongMoves: pendingReview.ignoredWrongMoves,
      hintsUsed: pendingReview.hintsUsed,
      timeSpentSec: pendingReview.timeSpentSec,
      orientation,
    });
    setPendingReviews((previousPendingReviews) => previousPendingReviews.slice(1));
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
    const nowMs = Date.now();
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
        if (
          lastTrainVariant?.variant.fullName !== trainVariant.variant.fullName
        ) {
          setLastTrainVariant(trainVariant);
        }
        const finishedVariantName = trainVariant.variant.fullName;
        const openingName = getOpeningNameFromVariant(finishedVariantName);
        const startedAtMs = variantStartTimes[finishedVariantName] ?? nowMs;
        const timeSpentSec = Math.max(1, Math.floor((nowMs - startedAtMs) / 1000));
        const suggestedRating = suggestReviewRating(
          lastErrors + lastIgnoredErrors,
          0,
          timeSpentSec
        );
        setPendingReviews((previousPendingReviews) => {
          if (
            previousPendingReviews.some(
              (pendingReview) => pendingReview.variantName === finishedVariantName
            )
          ) {
            return previousPendingReviews;
          }
          return [
            ...previousPendingReviews,
            {
              variantName: finishedVariantName,
              openingName,
              startingFen: chess.fen(),
              wrongMoves: lastErrors,
              ignoredWrongMoves: lastIgnoredErrors,
              hintsUsed: 0,
              timeSpentSec,
              suggestedRating,
            },
          ];
        });
        setVariantStartTimes((previousStartTimes) => {
          const nextStartTimes = { ...previousStartTimes };
          delete nextStartTimes[finishedVariantName];
          return nextStartTimes;
        });
        setLastErrors(0);
        setLastIgnoredErrors(0);
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
      lastErrors,
      setLastErrors,
      lastIgnoredErrors,
      setLastIgnoredErrors,
      pendingVariantReview: pendingReviews[0] || null,
      submitPendingVariantReview,
    }),
    [
      turn,
      isYourTurn,
      allowedMoves,
      trainVariants,
      lastTrainVariant,
      chooseTrainVariantsToTrain,
      lastErrors,
      setLastErrors,
      lastIgnoredErrors,
      setLastIgnoredErrors,
      pendingReviews,
      submitPendingVariantReview,
    ]
  );

  return (
    <TrainRepertoireContext.Provider value={value}>
      {children}
    </TrainRepertoireContext.Provider>
  );
};

function getOpeningNameFromVariant(variantName: string): string {
  const openingName = variantName.split(":")[0]?.trim();
  return openingName || variantName;
}
