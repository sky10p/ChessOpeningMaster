import React, { useCallback, useEffect, useMemo } from "react";
import { useRepertoireContext } from "./RepertoireContext";
import { MoveVariantNode } from "../models/VariantNode";
import { TrainVariant } from "../models/chess.models";
import { deepEqual } from "../utils/deepEqual";
import {
  getVariantMistakes,
  getTrainVariantInfo,
  saveVariantMistakeReview,
  saveVariantReview,
} from "../repository/repertoires/trainVariants";
import {
  MistakeSnapshotItem,
  ReviewRating,
  TrainVariantInfo,
  VariantMistake,
  VariantReviewInput,
} from "@chess-opening-master/common";
import { useLocation } from "react-router-dom";
import {
  buildMistakeKey,
  buildPendingVariantReview,
  buildVariantStartStateByVariant,
  computeNextMastery,
  getAllowedMovesFromTrainVariants,
  getDefaultTrainVariants,
  getVariantFenAtPly,
  getOpeningNameFromVariant,
  getVariantByName,
  getVariantStartPly,
  mergeMistakesByKey,
  removePendingReviewByVariantName,
  removeVariantFromStartFens,
  removeVariantFromStartTimes,
} from "./TrainRepertoireContext.utils";

export type TrainingPhase = "standard" | "reinforcement" | "fullRunConfirm";

export type PendingVariantReview = {
  variantName: string;
  openingName: string;
  startingFen: string;
  wrongMoves: number;
  ignoredWrongMoves: number;
  hintsUsed: number;
  timeSpentSec: number;
  suggestedRating: ReviewRating;
  mistakes: MistakeSnapshotItem[];
  reinforcementMistakes: MistakeSnapshotItem[];
  masteryBefore: number;
  projectedMasteryAfter: number;
  perfectRunStreakBefore: number;
};

type ReinforcementQueueItem = MistakeSnapshotItem & {
  variantName: string;
  openingName: string;
};

export type ReinforcementSession = {
  variantName: string;
  openingName: string;
  queue: ReinforcementQueueItem[];
  total: number;
  solved: number;
  awaitingRating: boolean;
  source: "review" | "mistakeOnly";
};

export type ReinforcementMoveProgress = {
  statuses: Array<"pending" | "success" | "failed">;
  activeIndex: number;
  mistakeKey: string;
};

export type FullRunConfirmState = {
  variantName: string;
  openingName: string;
  startedAtMs: number;
  completed: boolean;
  perfect: boolean;
  masteryBefore: number;
  masteryAfter: number;
};

interface TrainRepertoireContextProps {
  turn: "white" | "black";
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
  lastHintsUsed: number;
  markHintUsed: () => void;
  pendingVariantReview: PendingVariantReview | null;
  submitPendingVariantReview: (
    rating: ReviewRating
  ) => Promise<{ variantInfo?: TrainVariantInfo } | null>;
  registerWrongMove: (attemptedMoveLan: string, positionFen: string) => void;
  trainingPhase: TrainingPhase;
  mode: "standard" | "mistakes";
  reinforcementSession: ReinforcementSession | null;
  startMistakeReinforcement: (review: PendingVariantReview) => void;
  markReinforcementFailure: () => void;
  markReinforcementSuccess: (playedMoveLan: string) => void;
  submitCurrentMistakeRating: (rating: ReviewRating) => Promise<VariantMistake | null>;
  isSavingMistakeRating: boolean;
  reinforcementMoveProgress: ReinforcementMoveProgress | null;
  focusModeProgress: ReinforcementMoveProgress | null;
  fullRunConfirmState: FullRunConfirmState | null;
  finishFullRunConfirm: () => void;
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

const toVariantInfoMap = (
  variantInfo: TrainVariantInfo[]
): Record<string, TrainVariantInfo> => {
  const map: Record<string, TrainVariantInfo> = {};
  variantInfo.forEach((item) => {
    map[item.variantName] = item;
  });
  return map;
};

export const TrainRepertoireContextProvider: React.FC<
  TrainRepertoireContextProviderProps
> = ({ children }) => {
  const [turn, setTurn] = React.useState<"white" | "black">("white");
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
  const mode: "standard" | "mistakes" =
    params.get("mode") === "mistakes" ? "mistakes" : "standard";
  const variantName = params.get("variantName") || undefined;
  const openingName = params.get("openingName") || undefined;
  const variantNamesParam = params.get("variantNames") || undefined;
  const mistakeKeyParam = params.get("mistakeKey") || undefined;
  const mistakeKeysParam = params.get("mistakeKeys") || undefined;
  const variantNames = variantNamesParam
    ? new Set(variantNamesParam.split("|").filter(Boolean))
    : undefined;
  const selectedMistakeKeys = useMemo(
    () =>
      new Set(
        [
          ...(mistakeKeyParam ? [mistakeKeyParam] : []),
          ...(mistakeKeysParam ? mistakeKeysParam.split("|").filter(Boolean) : []),
        ].filter(Boolean)
      ),
    [mistakeKeyParam, mistakeKeysParam]
  );
  const defaultTrainVariants: TrainVariant[] = getDefaultTrainVariants(
    variants,
    variantName,
    variantNames
  ).filter((trainVariant) => {
    if (!openingName) {
      return true;
    }
    const variantOpeningName = getOpeningNameFromVariant(
      trainVariant.variant.fullName
    );
    return (
      variantOpeningName === openingName ||
      trainVariant.variant.name === openingName ||
      trainVariant.variant.fullName === openingName
    );
  });

  const initialVariantStartState = useMemo(
    () => buildVariantStartStateByVariant(defaultTrainVariants, Date.now()),
    [defaultTrainVariants]
  );

  const [allowedMoves, setAllowedMoves] = React.useState<MoveVariantNode[]>([]);
  const [trainVariants, setTrainVariants] =
    React.useState<TrainVariant[]>(defaultTrainVariants);
  const [lastTrainVariant, setLastTrainVariant] = React.useState<TrainVariant>();
  const [lastErrors, setLastErrors] = React.useState<number>(0);
  const [lastIgnoredErrors, setLastIgnoredErrors] = React.useState<number>(0);
  const [lastHintsUsed, setLastHintsUsed] = React.useState<number>(0);
  const [pendingReviews, setPendingReviews] = React.useState<PendingVariantReview[]>(
    []
  );
  const [variantStartFens, setVariantStartFens] = React.useState<Record<string, string>>(
    initialVariantStartState.startFens
  );
  const [variantStartTimes, setVariantStartTimes] = React.useState<
    Record<string, number>
  >(initialVariantStartState.startTimes);
  const [variantStartPlys, setVariantStartPlys] = React.useState<Record<string, number>>(
    initialVariantStartState.startPlys
  );
  const [mistakesByVariant, setMistakesByVariant] = React.useState<
    Record<string, MistakeSnapshotItem[]>
  >({});
  const [mistakeEventsByVariant, setMistakeEventsByVariant] = React.useState<
    Record<string, MistakeSnapshotItem[]>
  >({});
  const [variantInfoMap, setVariantInfoMap] = React.useState<
    Record<string, TrainVariantInfo>
  >({});
  const [trainingPhase, setTrainingPhase] = React.useState<TrainingPhase>("standard");
  const [reinforcementSession, setReinforcementSession] = React.useState<
    ReinforcementSession | null
  >(null);
  const [reinforcementMoveProgress, setReinforcementMoveProgress] =
    React.useState<ReinforcementMoveProgress | null>(null);
  const [focusFailedIndices, setFocusFailedIndices] = React.useState<number[]>([]);
  const [fullRunConfirmState, setFullRunConfirmState] = React.useState<
    FullRunConfirmState | null
  >(null);
  const [fullRunMistakes, setFullRunMistakes] = React.useState<MistakeSnapshotItem[]>(
    []
  );
  const [isSavingMistakeRating, setIsSavingMistakeRating] = React.useState(false);
  const submittingReviewKeyRef = React.useRef<string | null>(null);
  const directMistakeSessionStartedKeyRef = React.useRef<string | null>(null);
  const fullRunRetryKeyRef = React.useRef<string | null>(null);
  const directMistakeSessionKey = useMemo(
    () =>
      `${repertoireId}::${openingName || ""}::${Array.from(
        selectedMistakeKeys.values()
      )
        .sort()
        .join("|")}`,
    [openingName, repertoireId, selectedMistakeKeys]
  );

  useEffect(() => {
    let ignore = false;
    const loadVariantInfo = async () => {
      try {
        const variantInfo = await getTrainVariantInfo(repertoireId);
        if (!ignore) {
          setVariantInfoMap(toVariantInfoMap(variantInfo));
        }
      } catch {
        if (!ignore) {
          setVariantInfoMap({});
        }
      }
    };
    void loadVariantInfo();
    return () => {
      ignore = true;
    };
  }, [repertoireId]);

  useEffect(() => {
    if (selectedMistakeKeys.size === 0) {
      directMistakeSessionStartedKeyRef.current = null;
    }
  }, [selectedMistakeKeys.size]);

  useEffect(() => {
    if (
      mode !== "mistakes" ||
      selectedMistakeKeys.size === 0 ||
      trainingPhase !== "standard" ||
      reinforcementSession ||
      directMistakeSessionStartedKeyRef.current === directMistakeSessionKey
    ) {
      return;
    }
    let cancelled = false;
    const loadMistakesSession = async () => {
      try {
        const mistakes = await getVariantMistakes(repertoireId, {
          openingName,
          dueOnly: false,
        });
        if (cancelled) {
          return;
        }
        const filtered = mistakes.filter((mistake) =>
          selectedMistakeKeys.has(mistake.mistakeKey)
        );
        if (filtered.length === 0) {
          return;
        }
        directMistakeSessionStartedKeyRef.current = directMistakeSessionKey;
        const queue: ReinforcementQueueItem[] = filtered.map((mistake) => ({
          mistakeKey: mistake.mistakeKey,
          mistakePly: mistake.mistakePly,
          variantStartPly: mistake.variantStartPly,
          positionFen: mistake.positionFen,
          expectedMoveLan: mistake.expectedMoveLan,
          expectedMoveSan: mistake.expectedMoveSan,
          actualMoveLan: undefined,
          variantName: mistake.variantName,
          openingName: mistake.openingName,
        }));
        setTrainingPhase("reinforcement");
        setFullRunConfirmState(null);
        setReinforcementMoveProgress(null);
        setFocusFailedIndices([]);
        setReinforcementSession({
          variantName: queue[0].variantName,
          openingName: queue[0].openingName,
          queue,
          total: queue.length,
          solved: 0,
          awaitingRating: false,
          source: "mistakeOnly",
        });
      } catch {
        return;
      }
    };
    void loadMistakesSession();
    return () => {
      cancelled = true;
    };
  }, [
    mode,
    directMistakeSessionKey,
    openingName,
    repertoireId,
    reinforcementSession,
    selectedMistakeKeys,
    trainingPhase,
  ]);

  const playOpponentMove = useCallback(async () => {
    await sleep(350);
    const randomMove = Math.floor(Math.random() * allowedMoves.length);
    goToMove(allowedMoves[randomMove]);
  }, [allowedMoves, goToMove]);

  const chooseTrainVariantsToTrain = useCallback(
    (selectedTrainVariants: TrainVariant[]) => {
      const nowMs = Date.now();
      const startState = buildVariantStartStateByVariant(
        selectedTrainVariants,
        nowMs
      );
      setTrainVariants(selectedTrainVariants);
      initBoard();
      setVariantStartTimes(startState.startTimes);
      setVariantStartFens(startState.startFens);
      setVariantStartPlys(startState.startPlys);
      setMistakesByVariant({});
      setMistakeEventsByVariant({});
      setPendingReviews([]);
      setTrainingPhase("standard");
      setReinforcementSession(null);
      setReinforcementMoveProgress(null);
      setFocusFailedIndices([]);
      setFullRunConfirmState(null);
      setFullRunMistakes([]);
      fullRunRetryKeyRef.current = null;
      setLastErrors(0);
      setLastIgnoredErrors(0);
      setLastHintsUsed(0);
    },
    [initBoard]
  );

  const markHintUsed = useCallback(() => {
    setLastHintsUsed((previousHintsUsed) => previousHintsUsed + 1);
  }, []);

  const submitPendingVariantReview = useCallback(
    async (rating: ReviewRating) => {
      const pendingReview = pendingReviews[0];
      if (!pendingReview) {
        return null;
      }
      const reviewKey = `${pendingReview.variantName}::${pendingReview.startingFen}`;
      if (submittingReviewKeyRef.current === reviewKey) {
        return null;
      }
      submittingReviewKeyRef.current = reviewKey;
      try {
        const payload: VariantReviewInput = {
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
          mistakes: pendingReview.mistakes,
        };
        const response = await saveVariantReview(repertoireId, payload);
        const variantInfo = response?.variantInfo as TrainVariantInfo | undefined;
        if (variantInfo?.variantName) {
          setVariantInfoMap((previous) => ({
            ...previous,
            [variantInfo.variantName]: {
              ...variantInfo,
              lastDate: new Date(variantInfo.lastDate),
              dueAt: variantInfo.dueAt ? new Date(variantInfo.dueAt) : undefined,
              lastReviewedAt: variantInfo.lastReviewedAt
                ? new Date(variantInfo.lastReviewedAt)
                : undefined,
              masteryUpdatedAt: variantInfo.masteryUpdatedAt
                ? new Date(variantInfo.masteryUpdatedAt)
                : undefined,
            },
          }));
        }
        setPendingReviews((previousPendingReviews) =>
          removePendingReviewByVariantName(
            previousPendingReviews,
            pendingReview.variantName
          )
        );
        return { variantInfo };
      } finally {
        if (submittingReviewKeyRef.current === reviewKey) {
          submittingReviewKeyRef.current = null;
        }
      }
    },
    [orientation, pendingReviews, repertoireId]
  );

  const registerWrongMove = useCallback(
    (attemptedMoveLan: string, positionFen: string) => {
      if (trainingPhase !== "standard" && trainingPhase !== "fullRunConfirm") {
        return;
      }
      if (!attemptedMoveLan || !positionFen) {
        return;
      }

      const buildMistake = (
        variantNameToUse: string,
        variantMoves: MoveVariantNode[],
        variantStartPly: number
      ): MistakeSnapshotItem | null => {
        const expectedMoveNode =
          variantMoves.find(
            (moveNode) => moveNode.position === currentMoveNode.position + 1
          ) || variantMoves[currentMoveNode.position];
        if (!expectedMoveNode) {
          return null;
        }
        const expectedMoveLan = expectedMoveNode.getMove().lan;
        return {
          mistakeKey: buildMistakeKey(
            variantNameToUse,
            expectedMoveNode.position,
            expectedMoveLan,
            variantStartPly
          ),
          mistakePly: expectedMoveNode.position,
          variantStartPly,
          positionFen,
          expectedMoveLan,
          expectedMoveSan: expectedMoveNode.getMove().san,
          actualMoveLan: attemptedMoveLan,
        };
      };

      const focusVariantParam = variantName;
      if (trainingPhase === "fullRunConfirm") {
        const fullRunVariant = fullRunConfirmState
          ? getVariantByName(variants, fullRunConfirmState.variantName)
          : undefined;
        if (!fullRunVariant) {
          return;
        }
        const fullRunVariantName = fullRunVariant.fullName;
        const variantStartPly = getVariantStartPly(fullRunVariant);
        const mistake = buildMistake(
          fullRunVariantName,
          fullRunVariant.moves,
          variantStartPly
        );
        if (!mistake) {
          return;
        }
        setFullRunMistakes((previous) => [...previous, mistake]);
        if (
          mode === "mistakes" &&
          focusVariantParam &&
          (focusVariantParam === fullRunVariant.fullName ||
            focusVariantParam === fullRunVariant.name)
        ) {
          const failedIndex = Math.max(
            0,
            mistake.mistakePly - Math.max(1, variantStartPly + 1)
          );
          setFocusFailedIndices((previousFailed) =>
            previousFailed.includes(failedIndex)
              ? previousFailed
              : [...previousFailed, failedIndex]
          );
        }
        return;
      }

      const inProgressVariants = trainVariants.filter(
        (trainVariant) => trainVariant.state === "inProgress"
      );
      if (inProgressVariants.length === 0) {
        return;
      }
      setMistakesByVariant((previous) => {
        const next = { ...previous };
        inProgressVariants.forEach((trainVariant) => {
          const currentVariantName = trainVariant.variant.fullName;
          const variantStartPly =
            variantStartPlys[currentVariantName] ??
            getVariantStartPly(trainVariant.variant);
          const mistake = buildMistake(
            currentVariantName,
            trainVariant.variant.moves,
            variantStartPly
          );
          if (!mistake) {
            return;
          }
          next[currentVariantName] = mergeMistakesByKey(
            next[currentVariantName] || [],
            [mistake]
          );
          if (
            mode === "mistakes" &&
            focusVariantParam &&
            (focusVariantParam === trainVariant.variant.fullName ||
              focusVariantParam === trainVariant.variant.name)
          ) {
            const failedIndex = Math.max(
              0,
              mistake.mistakePly - Math.max(1, variantStartPly + 1)
            );
            setFocusFailedIndices((previousFailed) =>
              previousFailed.includes(failedIndex)
                ? previousFailed
                : [...previousFailed, failedIndex]
            );
          }
        });
        return next;
      });
      setMistakeEventsByVariant((previous) => {
        const next = { ...previous };
        inProgressVariants.forEach((trainVariant) => {
          const currentVariantName = trainVariant.variant.fullName;
          const variantStartPly =
            variantStartPlys[currentVariantName] ??
            getVariantStartPly(trainVariant.variant);
          const mistake = buildMistake(
            currentVariantName,
            trainVariant.variant.moves,
            variantStartPly
          );
          if (!mistake) {
            return;
          }
          next[currentVariantName] = [...(next[currentVariantName] || []), mistake];
        });
        return next;
      });
    },
    [
      currentMoveNode.position,
      fullRunConfirmState,
      mode,
      trainVariants,
      trainingPhase,
      variantName,
      variantStartPlys,
      variants,
    ]
  );

  const updateTrainVariants = useCallback(
    (lastMove: MoveVariantNode) => {
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
          const openingNameFromVariant = getOpeningNameFromVariant(
            finishedVariantName
          );
          const startedAtMs = variantStartTimes[finishedVariantName] ?? nowMs;
          const startingFen =
            variantStartFens[finishedVariantName] || chess.fen();
          const timeSpentSec = Math.max(
            1,
            Math.floor((nowMs - startedAtMs) / 1000)
          );
          const previousInfo = variantInfoMap[finishedVariantName];
          const masteryBefore =
            typeof previousInfo?.masteryScore === "number"
              ? previousInfo.masteryScore
              : 0;
          const perfectRunStreakBefore =
            typeof previousInfo?.perfectRunStreak === "number"
              ? previousInfo.perfectRunStreak
              : 0;
          const suggestedReview = buildPendingVariantReview({
            variantName: finishedVariantName,
            openingName: openingNameFromVariant,
            startingFen,
            wrongMoves: lastErrors,
            ignoredWrongMoves: lastIgnoredErrors,
            hintsUsed: lastHintsUsed,
            timeSpentSec,
          });
          const projectedMasteryAfter = computeNextMastery({
            previousMastery: masteryBefore,
            rating: suggestedReview.suggestedRating,
            wrongMoves: suggestedReview.wrongMoves,
            ignoredWrongMoves: suggestedReview.ignoredWrongMoves,
            hintsUsed: suggestedReview.hintsUsed,
          });
          setPendingReviews((previousPendingReviews) => {
            if (
              previousPendingReviews.some(
                (pendingReview) =>
                  pendingReview.variantName === finishedVariantName
              )
            ) {
              return previousPendingReviews;
            }
            return [
              ...previousPendingReviews,
              {
                ...suggestedReview,
                mistakes: mistakesByVariant[finishedVariantName] || [],
                reinforcementMistakes:
                  mistakeEventsByVariant[finishedVariantName] ||
                  mistakesByVariant[finishedVariantName] ||
                  [],
                masteryBefore,
                projectedMasteryAfter,
                perfectRunStreakBefore,
              },
            ];
          });
          setVariantStartTimes((previousStartTimes) => {
            return removeVariantFromStartTimes(
              previousStartTimes,
              finishedVariantName
            );
          });
          setVariantStartFens((previousStartFens) => {
            return removeVariantFromStartFens(
              previousStartFens,
              finishedVariantName
            );
          });
          setVariantStartPlys((previousStartPlys) => {
            const nextStartPlys = { ...previousStartPlys };
            delete nextStartPlys[finishedVariantName];
            return nextStartPlys;
          });
          setMistakesByVariant((previousMistakes) => {
            const nextMistakes = { ...previousMistakes };
            delete nextMistakes[finishedVariantName];
            return nextMistakes;
          });
          setMistakeEventsByVariant((previousMistakes) => {
            const nextMistakes = { ...previousMistakes };
            delete nextMistakes[finishedVariantName];
            return nextMistakes;
          });
          setLastErrors(0);
          setLastIgnoredErrors(0);
          setLastHintsUsed(0);
          return { ...trainVariant, state: "finished" } as TrainVariant;
        }
        return trainVariant;
      });
      setTrainVariants(newTrainVariants);
      return newTrainVariants;
    },
    [
      chess,
      lastErrors,
      lastHintsUsed,
      lastIgnoredErrors,
      lastTrainVariant?.variant.fullName,
      mistakeEventsByVariant,
      mistakesByVariant,
      trainVariants,
      variantInfoMap,
      variantStartFens,
      variantStartTimes,
    ]
  );

  const getExpectedMistakeMoveNode = useCallback(
    (variantName: string, mistake: ReinforcementQueueItem) => {
      const variant = getVariantByName(variants, variantName);
      if (!variant) {
        return undefined;
      }
      return (
        variant.moves.find(
          (moveNode) =>
            moveNode.position === mistake.mistakePly &&
            moveNode.getMove().lan === mistake.expectedMoveLan
        ) ||
        variant.moves.find((moveNode) => moveNode.position === mistake.mistakePly)
      );
    },
    [variants]
  );

  const startFullRunConfirm = useCallback(
    (variantNameToConfirm: string, openingNameToConfirm: string) => {
      const variant = getVariantByName(variants, variantNameToConfirm);
      if (!variant) {
        setTrainingPhase("standard");
        setReinforcementSession(null);
        setReinforcementMoveProgress(null);
        return;
      }
      const startPly =
        variantStartPlys[variantNameToConfirm] ?? getVariantStartPly(variant);
      const startNode =
        startPly > 0
          ? variant.moves.find((moveNode) => moveNode.position === startPly)
          : undefined;
      const startedAtMs = Date.now();
      const masteryBefore =
        typeof variantInfoMap[variantNameToConfirm]?.masteryScore === "number"
          ? (variantInfoMap[variantNameToConfirm]?.masteryScore as number)
          : 0;
      setTrainingPhase("fullRunConfirm");
      setReinforcementSession(null);
      setReinforcementMoveProgress(null);
      setFocusFailedIndices([]);
      setFullRunConfirmState({
        variantName: variantNameToConfirm,
        openingName: openingNameToConfirm,
        startedAtMs,
        completed: false,
        perfect: false,
        masteryBefore,
        masteryAfter: masteryBefore,
      });
      setFullRunMistakes([]);
      fullRunRetryKeyRef.current = null;
      setLastErrors(0);
      setLastIgnoredErrors(0);
      setLastHintsUsed(0);
      if (startNode) {
        goToMove(startNode);
      } else {
        initBoard();
      }
    },
    [goToMove, initBoard, variantInfoMap, variantStartPlys, variants]
  );

  const startMistakeReinforcement = useCallback(
    (review: PendingVariantReview) => {
      const reinforcementMistakes =
        review.reinforcementMistakes.length > 0
          ? review.reinforcementMistakes
          : review.mistakes;
      if (!reinforcementMistakes.length) {
        startFullRunConfirm(review.variantName, review.openingName);
        return;
      }
      const queue: ReinforcementQueueItem[] = reinforcementMistakes.map(
        (mistake) => ({
          ...mistake,
          variantName: review.variantName,
          openingName: review.openingName,
        })
      );
      setTrainingPhase("reinforcement");
      setFullRunConfirmState(null);
      setReinforcementMoveProgress(null);
      setFocusFailedIndices([]);
      setFullRunMistakes([]);
      fullRunRetryKeyRef.current = null;
      setReinforcementSession({
        variantName: review.variantName,
        openingName: review.openingName,
        queue,
        total: queue.length,
        solved: 0,
        awaitingRating: false,
        source: "review",
      });
    },
    [startFullRunConfirm]
  );

  const markReinforcementFailure = useCallback(() => {
    setReinforcementMoveProgress((previous) => {
      if (!previous) {
        return previous;
      }
      const nextStatuses = [...previous.statuses];
      nextStatuses[previous.activeIndex] = "failed";
      return {
        ...previous,
        statuses: nextStatuses,
      };
    });
    window.setTimeout(() => {
      setReinforcementSession((previous) => {
        if (!previous || previous.awaitingRating || previous.queue.length === 0) {
          return previous;
        }
        const [current, ...rest] = previous.queue;
        return {
          ...previous,
          queue: [...rest, current],
        };
      });
    }, 220);
  }, []);

  const markReinforcementSuccess = useCallback(
    (playedMoveLan: string) => {
      setReinforcementSession((previous) => {
        if (!previous || previous.awaitingRating || previous.queue.length === 0) {
          return previous;
        }
        const [current, ...rest] = previous.queue;
        if (current.expectedMoveLan !== playedMoveLan) {
          return previous;
        }
        setReinforcementMoveProgress((progress) => {
          if (!progress) {
            return progress;
          }
          const nextStatuses = [...progress.statuses];
          nextStatuses[progress.activeIndex] = "success";
          return {
            ...progress,
            statuses: nextStatuses,
          };
        });
        if (previous.source === "mistakeOnly") {
          return {
            ...previous,
            awaitingRating: true,
          };
        }
        void saveVariantMistakeReview(repertoireId, {
          mistakeKey: current.mistakeKey,
          rating: "good",
        }).catch(() => undefined);
        return {
          ...previous,
          queue: rest,
          solved: previous.solved + 1,
          awaitingRating: false,
        };
      });
    },
    [repertoireId]
  );

  const submitCurrentMistakeRating = useCallback(
    async (rating: ReviewRating) => {
      const activeSession = reinforcementSession;
      const currentMistake = activeSession?.queue[0];
      if (!activeSession || !currentMistake) {
        return null;
      }
      setIsSavingMistakeRating(true);
      try {
        const result = await saveVariantMistakeReview(repertoireId, {
          mistakeKey: currentMistake.mistakeKey,
          rating,
        });
        setReinforcementSession((previous) => {
          if (!previous || previous.queue.length === 0) {
            return previous;
          }
          const [, ...rest] = previous.queue;
          return {
            ...previous,
            queue: rest,
            solved: previous.solved + 1,
            awaitingRating: false,
          };
        });
        return result;
      } finally {
        setIsSavingMistakeRating(false);
      }
    },
    [reinforcementSession, repertoireId]
  );

  const finishFullRunConfirm = useCallback(() => {
    setTrainingPhase("standard");
    setFullRunConfirmState(null);
    setFullRunMistakes([]);
    fullRunRetryKeyRef.current = null;
    setReinforcementMoveProgress(null);
    setFocusFailedIndices([]);
    setLastErrors(0);
    setLastIgnoredErrors(0);
    setLastHintsUsed(0);
  }, []);

  useEffect(() => {
    setTurn(currentMoveNode.move?.color === "w" ? "black" : "white");
    if (trainingPhase === "standard") {
      updateTrainVariants(currentMoveNode);
    }
  }, [currentMoveNode, trainingPhase, updateTrainVariants]);

  useEffect(() => {
    if (trainingPhase !== "reinforcement" || !reinforcementSession) {
      return;
    }
    const currentMistake = reinforcementSession.queue[0];
    if (!currentMistake) {
      if (reinforcementSession.source === "review") {
        startFullRunConfirm(
          reinforcementSession.variantName,
          reinforcementSession.openingName
        );
      } else {
        setTrainingPhase("standard");
        setReinforcementSession(null);
        setReinforcementMoveProgress(null);
      }
      return;
    }
    if (reinforcementSession.awaitingRating) {
      return;
    }
    let cancelled = false;
    const runReplay = async () => {
      const variant = getVariantByName(variants, currentMistake.variantName);
      if (!variant) {
        setReinforcementSession((previous) => {
          if (!previous || previous.queue.length === 0) {
            return previous;
          }
          const [, ...rest] = previous.queue;
          return {
            ...previous,
            queue: rest,
          };
        });
        return;
      }
      const expectedMoveNode = getExpectedMistakeMoveNode(
        currentMistake.variantName,
        currentMistake
      );
      if (!expectedMoveNode) {
        setReinforcementSession((previous) => {
          if (!previous || previous.queue.length === 0) {
            return previous;
          }
          const [, ...rest] = previous.queue;
          return {
            ...previous,
            queue: rest,
          };
        });
        return;
      }
      const replayStartPly = Math.max(0, currentMistake.variantStartPly);
      const replayStartNode =
        replayStartPly > 0
          ? variant.moves.find((moveNode) => moveNode.position === replayStartPly)
          : undefined;
      const progressMoves = variant.moves
        .filter((moveNode) => moveNode.position > replayStartPly)
        .sort((left, right) => left.position - right.position);
      const toProgressIndex = (position: number) =>
        Math.min(
          Math.max(0, progressMoves.length - 1),
          Math.max(0, position - replayStartPly - 1)
        );
      const progressKey = `${currentMistake.variantName}::${replayStartPly}`;
      const replayMoves = variant.moves
        .filter(
          (moveNode) =>
            moveNode.position > replayStartPly &&
            moveNode.position < currentMistake.mistakePly
        )
        .sort((left, right) => left.position - right.position);
      setReinforcementMoveProgress((previous) => {
        const hasMatchingProgress =
          previous &&
          previous.mistakeKey === progressKey &&
          previous.statuses.length === progressMoves.length;
        const statuses: Array<"pending" | "success" | "failed"> = hasMatchingProgress
          ? [...(previous?.statuses || [])]
          : Array.from(
              { length: Math.max(1, progressMoves.length) },
              () => "success" as const
            );
        reinforcementSession.queue
          .filter((item) => item.variantName === currentMistake.variantName)
          .forEach((item) => {
            const failedIndex = toProgressIndex(item.mistakePly);
            if (failedIndex >= 0 && failedIndex < statuses.length) {
              statuses[failedIndex] = "failed";
            }
          });
        return {
          statuses,
          activeIndex: toProgressIndex(currentMistake.mistakePly),
          mistakeKey: progressKey,
        };
      });
      if (replayStartNode) {
        goToMove(replayStartNode);
      } else {
        initBoard();
      }
      await sleep(200);
      for (let index = 0; index < replayMoves.length; index += 1) {
        if (cancelled) {
          return;
        }
        const replayMoveNode = replayMoves[index];
        goToMove(replayMoveNode);
        setReinforcementMoveProgress((previous) => {
          if (!previous || previous.mistakeKey !== progressKey) {
            return previous;
          }
          const nextStatuses = [...previous.statuses];
          const progressIndex = toProgressIndex(replayMoveNode.position);
          if (progressIndex >= 0 && progressIndex < nextStatuses.length) {
            nextStatuses[progressIndex] = "success";
          }
          return {
            ...previous,
            statuses: nextStatuses,
            activeIndex: toProgressIndex(currentMistake.mistakePly),
          };
        });
        await sleep(200);
      }
      if (cancelled) {
        return;
      }
      const parentNode =
        expectedMoveNode.parent && expectedMoveNode.parent.position >= replayStartPly
          ? expectedMoveNode.parent
          : replayStartNode;
      if (parentNode) {
        goToMove(parentNode);
      } else {
        initBoard();
      }
      setReinforcementMoveProgress((previous) => {
        if (!previous || previous.mistakeKey !== progressKey) {
          return previous;
        }
        return {
          ...previous,
          activeIndex: toProgressIndex(currentMistake.mistakePly),
        };
      });
    };
    void runReplay();
    return () => {
      cancelled = true;
    };
  }, [
    getExpectedMistakeMoveNode,
    goToMove,
    initBoard,
    reinforcementSession,
    startFullRunConfirm,
    trainingPhase,
    variants,
  ]);

  useEffect(() => {
    if (trainingPhase !== "fullRunConfirm" || !fullRunConfirmState) {
      return;
    }
    if (fullRunConfirmState.completed) {
      return;
    }
    const variant = getVariantByName(variants, fullRunConfirmState.variantName);
    if (!variant) {
      return;
    }
    const hasNextMove = Boolean(
      variant.moves.find(
        (moveNode) => moveNode.position === currentMoveNode.position + 1
      ) || variant.moves[currentMoveNode.position]
    );
    if (hasNextMove) {
      return;
    }
    const perfect =
      lastErrors === 0 && lastIgnoredErrors === 0 && lastHintsUsed === 0;
    const masteryAfter = perfect
      ? Math.min(100, fullRunConfirmState.masteryBefore + 8)
      : fullRunConfirmState.masteryBefore;
    setFullRunConfirmState((previous) => {
      if (!previous) {
        return previous;
      }
      return {
        ...previous,
        completed: true,
        perfect,
        masteryAfter,
      };
    });
  }, [
    currentMoveNode.position,
    fullRunConfirmState,
    lastErrors,
    lastHintsUsed,
    lastIgnoredErrors,
    trainingPhase,
    variants,
  ]);

  useEffect(() => {
    if (
      trainingPhase !== "fullRunConfirm" ||
      !fullRunConfirmState ||
      !fullRunConfirmState.completed ||
      fullRunConfirmState.perfect
    ) {
      return;
    }
    const retryKey = `${fullRunConfirmState.variantName}::${fullRunConfirmState.startedAtMs}`;
    if (fullRunRetryKeyRef.current === retryKey) {
      return;
    }
    fullRunRetryKeyRef.current = retryKey;
    const fullRunVariant = getVariantByName(variants, fullRunConfirmState.variantName);
    const fullRunSnapshot = [...fullRunMistakes];
    if (fullRunSnapshot.length > 0) {
      const persistedMistakes = mergeMistakesByKey([], fullRunSnapshot);
      const variantStartPly = fullRunVariant ? getVariantStartPly(fullRunVariant) : 0;
      const startingFen = fullRunVariant
        ? getVariantFenAtPly(fullRunVariant, variantStartPly)
        : undefined;
      void saveVariantReview(repertoireId, {
        variantName: fullRunConfirmState.variantName,
        openingName: fullRunConfirmState.openingName,
        rating: "again",
        suggestedRating: "again",
        acceptedSuggested: true,
        wrongMoves: lastErrors,
        ignoredWrongMoves: lastIgnoredErrors,
        hintsUsed: lastHintsUsed,
        timeSpentSec: Math.max(
          1,
          Math.floor((Date.now() - fullRunConfirmState.startedAtMs) / 1000)
        ),
        orientation,
        startingFen,
        mistakes: persistedMistakes,
      })
        .then((response) => {
          const variantInfo = response?.variantInfo as TrainVariantInfo | undefined;
          if (!variantInfo?.variantName) {
            return;
          }
          setVariantInfoMap((previous) => ({
            ...previous,
            [variantInfo.variantName]: {
              ...variantInfo,
              lastDate: new Date(variantInfo.lastDate),
              dueAt: variantInfo.dueAt ? new Date(variantInfo.dueAt) : undefined,
              lastReviewedAt: variantInfo.lastReviewedAt
                ? new Date(variantInfo.lastReviewedAt)
                : undefined,
              masteryUpdatedAt: variantInfo.masteryUpdatedAt
                ? new Date(variantInfo.masteryUpdatedAt)
                : undefined,
            },
          }));
        })
        .catch(() => undefined);
    }
    if (!fullRunVariant || fullRunSnapshot.length === 0) {
      startFullRunConfirm(
        fullRunConfirmState.variantName,
        fullRunConfirmState.openingName
      );
      return;
    }
    const queue: ReinforcementQueueItem[] = fullRunSnapshot.map((mistake) => ({
      ...mistake,
      variantName: fullRunConfirmState.variantName,
      openingName: fullRunConfirmState.openingName,
    }));
    setTrainingPhase("reinforcement");
    setFullRunConfirmState(null);
    setReinforcementMoveProgress(null);
    setReinforcementSession({
      variantName: fullRunConfirmState.variantName,
      openingName: fullRunConfirmState.openingName,
      queue,
      total: queue.length,
      solved: 0,
      awaitingRating: false,
      source: "review",
    });
    setFullRunMistakes([]);
  }, [
    fullRunConfirmState,
    fullRunMistakes,
    lastErrors,
    lastHintsUsed,
    lastIgnoredErrors,
    orientation,
    repertoireId,
    startFullRunConfirm,
    trainingPhase,
    variants,
  ]);

  useEffect(() => {
    let newAllowedMoves: MoveVariantNode[] = [];
    if (trainingPhase === "standard") {
      newAllowedMoves = getAllowedMovesFromTrainVariants(
        trainVariants,
        currentMoveNode.position
      );
    }
    if (trainingPhase === "reinforcement") {
      const currentMistake = reinforcementSession?.queue[0];
      if (
        currentMistake &&
        !reinforcementSession.awaitingRating
      ) {
        const expectedMoveNode = getExpectedMistakeMoveNode(
          currentMistake.variantName,
          currentMistake
        );
        if (expectedMoveNode) {
          newAllowedMoves = [expectedMoveNode];
        }
      }
    }
    if (trainingPhase === "fullRunConfirm") {
      if (!fullRunConfirmState?.completed && fullRunConfirmState) {
        const variant = getVariantByName(variants, fullRunConfirmState.variantName);
        const nextMoveNode =
          variant?.moves.find(
            (moveNode) => moveNode.position === currentMoveNode.position + 1
          ) || variant?.moves[currentMoveNode.position];
        if (nextMoveNode) {
          newAllowedMoves = [nextMoveNode];
        }
      }
    }
    if (!deepEqual(newAllowedMoves, allowedMoves)) {
      setAllowedMoves(newAllowedMoves);
    }
  }, [
    allowedMoves,
    currentMoveNode.position,
    fullRunConfirmState,
    getExpectedMistakeMoveNode,
    reinforcementSession,
    trainVariants,
    trainingPhase,
    variants,
  ]);

  useEffect(() => {
    if (allowedMoves.length === 0) {
      if (trainingPhase === "standard") {
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
      return;
    }
    if (turn !== orientation && trainingPhase !== "reinforcement") {
      void playOpponentMove();
    }
  }, [allowedMoves, initBoard, orientation, playOpponentMove, trainVariants, trainingPhase, turn]);

  const focusModeProgress = useMemo(() => {
    if (trainingPhase === "reinforcement" && reinforcementMoveProgress) {
      return reinforcementMoveProgress;
    }
    if (
      mode !== "mistakes" ||
      !variantName ||
      (trainingPhase !== "standard" && trainingPhase !== "fullRunConfirm")
    ) {
      return null;
    }
    const focusVariant = getVariantByName(variants, variantName);
    if (!focusVariant) {
      return null;
    }
    const variantStartPly = getVariantStartPly(focusVariant);
    const totalSteps = Math.max(1, focusVariant.moves.length - variantStartPly);
    const statuses: Array<"pending" | "success" | "failed"> = Array.from(
      { length: totalSteps },
      () => "pending"
    );
    const completedCount = Math.min(
      totalSteps,
      Math.max(0, currentMoveNode.position - variantStartPly)
    );
    for (let index = 0; index < completedCount; index += 1) {
      statuses[index] = "success";
    }
    const failedIndices =
      trainingPhase === "fullRunConfirm"
        ? fullRunMistakes.map((mistake) =>
            Math.max(0, mistake.mistakePly - variantStartPly - 1)
          )
        : focusFailedIndices;
    failedIndices.forEach((index) => {
      if (index >= 0 && index < statuses.length) {
        statuses[index] = "failed";
      }
    });
    const activeIndex = Math.min(
      totalSteps - 1,
      Math.max(0, currentMoveNode.position - variantStartPly)
    );
    return {
      statuses,
      activeIndex,
      mistakeKey: `focus::${focusVariant.fullName}`,
    };
  }, [
    currentMoveNode.position,
    focusFailedIndices,
    fullRunMistakes,
    mode,
    reinforcementMoveProgress,
    trainingPhase,
    variantName,
    variants,
  ]);

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
      lastHintsUsed,
      markHintUsed,
      pendingVariantReview: pendingReviews[0] || null,
      submitPendingVariantReview,
      registerWrongMove,
      trainingPhase,
      mode,
      reinforcementSession,
      startMistakeReinforcement,
      markReinforcementFailure,
      markReinforcementSuccess,
      submitCurrentMistakeRating,
      isSavingMistakeRating,
      reinforcementMoveProgress,
      focusModeProgress,
      fullRunConfirmState,
      finishFullRunConfirm,
    }),
    [
      allowedMoves,
      chooseTrainVariantsToTrain,
      finishFullRunConfirm,
      fullRunConfirmState,
      isSavingMistakeRating,
      isYourTurn,
      lastErrors,
      lastHintsUsed,
      lastIgnoredErrors,
      lastTrainVariant,
      markHintUsed,
      markReinforcementFailure,
      markReinforcementSuccess,
      mode,
      pendingReviews,
      registerWrongMove,
      reinforcementSession,
      focusModeProgress,
      reinforcementMoveProgress,
      startMistakeReinforcement,
      submitCurrentMistakeRating,
      submitPendingVariantReview,
      trainVariants,
      trainingPhase,
      turn,
    ]
  );

  return (
    <TrainRepertoireContext.Provider value={value}>
      {children}
    </TrainRepertoireContext.Provider>
  );
};
