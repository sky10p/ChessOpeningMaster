/* eslint-disable @typescript-eslint/no-empty-function */
import React, { useReducer, useCallback } from "react";
import { TextDialog } from "../components/design/dialogs/TextDialog";
import { ConfirmDialog } from "../components/design/dialogs/ConfirmDialog";
import SelectTrainVariantsDialog from "../components/design/dialogs/SelectTrainVariantsDialog";
import { TrainVariant, Variant } from "../models/chess.models";
import SelectNextMoveDialog from "../components/design/dialogs/SelectNextMoveDialog";
import RepertoireDialog from "../components/design/dialogs/RepertoireDialog"; 
import SelectVariantsDialog from "../components/design/dialogs/SelectVariantsDialog";
import { NumberDialog } from "../components/design/dialogs/NumberDialog";
import { IRepertoire } from "@chess-opening-master/common";
import { TextAreaDialog } from "../components/design/dialogs/TextAreaDialog";

interface TextDialogProps {
  title: string;
  contentText: string;
  onTextConfirm: (text: string) => void;
  onDialogClose?: () => void;
}

interface TextAreaDialogProps {
  title: string;
  contentText: string;
  initialValue?: string;
  rows?: number;
  onTextConfirm: (text: string) => void;
  onDialogClose?: (isCancelled: boolean) => void;
}

interface ConfirmDialog {
  title?: string;
  contentText?: string;
  confirmLabel?: string;
  confirmIntent?: "accent" | "danger" | "primary";
  onConfirm: () => void;
  onDialogClose?: () => void;
}

interface SelectTrainVariantsConfirmDialog {
  title?: string;
  contentText?: string;
  trainVariants: TrainVariant[];
  repertoireId: string;
  onTrainVariantsConfirm: (trainVariants: TrainVariant[]) => void;
  onDialogClose?: () => void;
}

interface SelectVariantsConfirmDialog {
  title?: string;
  contentText?: string;
  variants: Variant[];
  onVariantsConfirm: (variants: Variant[]) => void;
  onDialogClose?: (isCancelled: boolean) => void;
}

interface SelectNextMoveDialog {
  title?: string;
  contentText?: string;
  nextMovements: string[];
  selectedVariantMove?: string;
  onNextMoveConfirm: (nextMove: string) => void;
  onDialogClose?: () => void;
}

interface RepertoireDialogProps {
  title: string;
  contentText: string;
  repertoires: IRepertoire[];
  onConfirm: (repertoire: IRepertoire) => void;
  onDialogClose?: () => void;
}

interface NumberDialogProps {
  title: string;
  contentText: string;
  min: number;
  max: number;
  initialValue: number;
  onNumberConfirm: (number: number) => void;
  onDialogClose?: (isCancelled: boolean) => void;
}

interface DialogContextProps {
  showTextDialog: (props: TextDialogProps) => void;
  showTextAreaDialog: (props: TextAreaDialogProps) => void;
  showConfirmDialog: (props: ConfirmDialog) => void;
  showTrainVariantsDialog: (props: SelectTrainVariantsConfirmDialog) => void;
  showSelectNextMoveDialog: (props: SelectNextMoveDialog) => void;
  showRepertoireDialog: (props: RepertoireDialogProps) => void;
  showSelectVariantsDialog: (props: SelectVariantsConfirmDialog) => void;
  showNumberDialog: (props: NumberDialogProps) => void;
}

export const DialogContext = React.createContext<DialogContextProps | null>(
  null
);

export const useDialogContext = (): DialogContextProps => {
  const context = React.useContext(DialogContext);

  if (context === null) {
    throw new Error(
      "useDialogContext must be used within a DialogContextProvider"
    );
  }

  return context;
};

interface State {
  openTextDialog: boolean;
  openTextAreaDialog: boolean;
  openConfirmDialog: boolean;
  openTrainVariantsDialog: boolean;
  openSelectNextMoveDialog: boolean;
  openRepertoireDialog: boolean;
  openSelectVariantsDialog: boolean;
  openNumberDialog: boolean;
  numberDialogProps: NumberDialogProps | null;
  title: string;
  contentText: string;
  initialValue: string;
  textAreaDialogProps: TextAreaDialogProps | null;
  onDialogClose?: (isCancelled: boolean) => void;
  confirmLabel?: string;
  confirmIntent?: "accent" | "danger" | "primary";
  onTextConfirm: (text: string) => void;
  onConfirm: () => void;
  onTrainVariantsConfirm: (trainVariants: TrainVariant[]) => void;
  onNextMoveConfirm: (nextMove: string) => void;
  onRepertoireConfirm: (repertoire: IRepertoire) => void;
  onVariantsConfirm: (variants: Variant[]) => void;
  trainVariants: TrainVariant[];
  nextMovements: string[];
  selectedVariantMove?: string;
  repertoires: IRepertoire[];
  variants: Variant[];
  repertoireId: string;
}

const initialState: State = {
  openTextDialog: false,
  openTextAreaDialog: false,
  openConfirmDialog: false,
  openTrainVariantsDialog: false,
  openSelectNextMoveDialog: false,
  openRepertoireDialog: false,
  openSelectVariantsDialog: false,
  openNumberDialog: false,
  numberDialogProps: null,
  title: "",
  contentText: "",
  initialValue: "",
  onDialogClose: undefined,
  confirmLabel: undefined,
  confirmIntent: undefined,
  textAreaDialogProps: null,
  onTextConfirm: () => {},
  onConfirm: () => {},
  onTrainVariantsConfirm: () => {},
  onNextMoveConfirm: () => {},
  onRepertoireConfirm: () => {},
  onVariantsConfirm: () => {},
  trainVariants: [],
  nextMovements: [],
  selectedVariantMove: undefined,
  repertoires: [],
  variants: [],
  repertoireId: "",
};

type Action =
  | { type: "SHOW_TEXT_DIALOG"; payload: TextDialogProps }
  | { type: "SHOW_TEXT_AREA_DIALOG"; payload: TextAreaDialogProps }
  | { type: "SHOW_CONFIRM_DIALOG"; payload: ConfirmDialog }
  | {
      type: "SHOW_TRAIN_VARIANTS_DIALOG";
      payload: SelectTrainVariantsConfirmDialog;
    }
  | { type: "SHOW_SELECT_NEXT_MOVE_DIALOG"; payload: SelectNextMoveDialog }
  | { type: "SHOW_REPERTOIRE_DIALOG"; payload: RepertoireDialogProps }
  | {
      type: "SHOW_SELECT_VARIANTS_DIALOG";
      payload: SelectVariantsConfirmDialog;
    }
  | { type: "SHOW_NUMBER_DIALOG"; payload: NumberDialogProps }
  | { type: "CLOSE_DIALOGS" };

function reducer(state: typeof initialState, action: Action): State {
  switch (action.type) {
    case "SHOW_TEXT_DIALOG":
      return {
        ...state,
        openTextDialog: true,
        title: action.payload.title,
        contentText: action.payload.contentText,
        onTextConfirm: action.payload.onTextConfirm,
        onDialogClose: action.payload.onDialogClose,
      };
    case "SHOW_TEXT_AREA_DIALOG":
      return {
        ...state,
        openTextAreaDialog: true,
        textAreaDialogProps: {
          title: action.payload.title,
          contentText: action.payload.contentText,
          initialValue: action.payload.initialValue || "",
          rows: action.payload.rows || 5,
          onTextConfirm: action.payload.onTextConfirm,
          onDialogClose: action.payload.onDialogClose,
        },
      };
    case "SHOW_CONFIRM_DIALOG":
      return {
        ...state,
        openConfirmDialog: true,
        title: action.payload.title ?? "Confirm operation",
        contentText: action.payload.contentText ?? "Are you sure?",
        confirmLabel: action.payload.confirmLabel,
        confirmIntent: action.payload.confirmIntent,
        onConfirm: action.payload.onConfirm,
        onDialogClose: action.payload.onDialogClose,
      };
    case "SHOW_TRAIN_VARIANTS_DIALOG":
      return {
        ...state,
        openTrainVariantsDialog: true,
        title: action.payload.title ?? "Select train variants",
        contentText:
          action.payload.contentText ??
          "Select variants to train or disable to ignore",
        trainVariants: action.payload.trainVariants,
        repertoireId: action.payload.repertoireId,
        onTrainVariantsConfirm: action.payload.onTrainVariantsConfirm,
        onDialogClose: action.payload.onDialogClose,
      };
    case "SHOW_SELECT_NEXT_MOVE_DIALOG":
      return {
        ...state,
        openSelectNextMoveDialog: true,
        title: action.payload.title ?? "Select next move",
        contentText:
          action.payload.contentText ?? "Select the movement to play",
        nextMovements: action.payload.nextMovements,
        selectedVariantMove: action.payload.selectedVariantMove,
        onNextMoveConfirm: action.payload.onNextMoveConfirm,
        onDialogClose: action.payload.onDialogClose,
      };
    case "SHOW_REPERTOIRE_DIALOG":
      return {
        ...state,
        openRepertoireDialog: true,
        title: action.payload.title,
        contentText: action.payload.contentText,
        repertoires: action.payload.repertoires,
        onRepertoireConfirm: action.payload.onConfirm,
        onDialogClose: action.payload.onDialogClose,
      };
    case "SHOW_SELECT_VARIANTS_DIALOG":
      return {
        ...state,
        openSelectVariantsDialog: true,
        title: action.payload.title ?? "Select variants",
        contentText:
          action.payload.contentText ?? "Select the variants to confirm",
        variants: action.payload.variants,
        onVariantsConfirm: action.payload.onVariantsConfirm,
        onDialogClose: action.payload.onDialogClose,
      };
    case "SHOW_NUMBER_DIALOG":
      return {
        ...state,
        openNumberDialog: true,
        numberDialogProps: {
          contentText: action.payload.contentText,
          title: action.payload.title,
          min: action.payload.min,
          max: action.payload.max,
          initialValue: action.payload.initialValue,
          onNumberConfirm: action.payload.onNumberConfirm,
          onDialogClose: action.payload.onDialogClose,
        },
      };
    case "CLOSE_DIALOGS":
      return {
        ...state,
        openTextDialog: false,
        openTextAreaDialog: false,
        openConfirmDialog: false,
        openTrainVariantsDialog: false,
        openSelectNextMoveDialog: false,
        openRepertoireDialog: false,
        openSelectVariantsDialog: false,
        openNumberDialog: false,
        textAreaDialogProps: null,
        numberDialogProps: null,
      };
    default:
      return state;
  }
}

export const DialogContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const showTextDialog = useCallback((props: TextDialogProps) => {
    dispatch({ type: "SHOW_TEXT_DIALOG", payload: props });
  }, []);

  const showTextAreaDialog = useCallback((props: TextAreaDialogProps) => {
    dispatch({ type: "SHOW_TEXT_AREA_DIALOG", payload: props });
  }, []);

  const showConfirmDialog = useCallback((props: ConfirmDialog) => {
    dispatch({ type: "SHOW_CONFIRM_DIALOG", payload: props });
  }, []);

  const showTrainVariantsDialog = useCallback((props: SelectTrainVariantsConfirmDialog) => {
    dispatch({ type: "SHOW_TRAIN_VARIANTS_DIALOG", payload: props });
  }, []);

  const showSelectNextMoveDialog = useCallback((props: SelectNextMoveDialog) => {
    dispatch({ type: "SHOW_SELECT_NEXT_MOVE_DIALOG", payload: props });
  }, []);

  const showRepertoireDialog = useCallback((props: RepertoireDialogProps) => {
    dispatch({ type: "SHOW_REPERTOIRE_DIALOG", payload: props });
  }, []);

  const showSelectVariantsDialog = useCallback((props: SelectVariantsConfirmDialog) => {
    dispatch({ type: "SHOW_SELECT_VARIANTS_DIALOG", payload: props });
  }, []);

  const showNumberDialog = useCallback((props: NumberDialogProps) => {
    dispatch({ type: "SHOW_NUMBER_DIALOG", payload: props });
  }, []);

  const handleDialogClose = useCallback((isCancelled: boolean) => {
    dispatch({ type: "CLOSE_DIALOGS" });
    state.numberDialogProps?.onDialogClose?.(isCancelled);
    state.textAreaDialogProps?.onDialogClose?.(isCancelled);
    state.onDialogClose && state.onDialogClose(isCancelled);
  }, [state.numberDialogProps, state.textAreaDialogProps, state.onDialogClose]);

  const handleTextConfirm = useCallback((text: string) => {
    dispatch({ type: "CLOSE_DIALOGS" });
    state.onTextConfirm(text);
  }, [state.onTextConfirm]);

  const handleTextAreaConfirm = useCallback((text: string) => {
    if (state.textAreaDialogProps && state.textAreaDialogProps.onTextConfirm) {
      dispatch({ type: "CLOSE_DIALOGS" });
      state.textAreaDialogProps.onTextConfirm(text);
    }
  }, [state.textAreaDialogProps]);

  const handleConfirm = useCallback(() => {
    dispatch({ type: "CLOSE_DIALOGS" });
    state.onConfirm();
  }, [state.onConfirm]);

  const handleTrainVariantsConfirm = useCallback((trainVariants: TrainVariant[]) => {
    dispatch({ type: "CLOSE_DIALOGS" });
    state.onTrainVariantsConfirm(trainVariants);
  }, [state.onTrainVariantsConfirm]);

  const handleNextMoveConfirm = useCallback((nextMove: string) => {
    dispatch({ type: "CLOSE_DIALOGS" });
    state.onNextMoveConfirm(nextMove);
  }, [state.onNextMoveConfirm]);

  const handleRepertoireConfirm = useCallback((repertoire: IRepertoire) => {
    dispatch({ type: "CLOSE_DIALOGS" });
    state.onRepertoireConfirm(repertoire);
  }, [state.onRepertoireConfirm]);

  const handleVariantsConfirm = useCallback((variants: Variant[]) => {
    dispatch({ type: "CLOSE_DIALOGS" });
    state.onVariantsConfirm(variants);
  }, [state.onVariantsConfirm]);

  const handleNumberConfirm = useCallback((number: number) => {
    if (state.numberDialogProps && state.numberDialogProps.onNumberConfirm) {
      dispatch({ type: "CLOSE_DIALOGS" });
      state.numberDialogProps.onNumberConfirm(number);
    }
  }, [state.numberDialogProps]);

  return (
    <DialogContext.Provider
      value={{
        showTextDialog,
        showTextAreaDialog,
        showConfirmDialog,
        showTrainVariantsDialog,
        showSelectNextMoveDialog,
        showRepertoireDialog,
        showSelectVariantsDialog,
        showNumberDialog,
      }}
    >
      {children}
      {state.openTextDialog && (
        <TextDialog
          open={state.openTextDialog}
          initialValue=""
          onClose={handleDialogClose}
          contentText={state.contentText}
          onTextConfirm={handleTextConfirm}
          title={state.title}
        />
      )}
      {state.textAreaDialogProps && (
        <TextAreaDialog
          open={state.openTextAreaDialog}
          initialValue={state.textAreaDialogProps.initialValue || ""}
          rows={state.textAreaDialogProps.rows}
          onClose={handleDialogClose}
          contentText={state.textAreaDialogProps.contentText}
          onTextConfirm={handleTextAreaConfirm}
          title={state.textAreaDialogProps.title}
        />
      )}
      {state.openConfirmDialog && (
        <ConfirmDialog
          open={state.openConfirmDialog}
          onClose={handleDialogClose}
          contentText={state.contentText}
          onConfirm={handleConfirm}
          title={state.title}
          confirmLabel={state.confirmLabel}
          confirmIntent={state.confirmIntent}
        />
      )}
      {state.openTrainVariantsDialog && (
        <SelectTrainVariantsDialog
          open={state.openTrainVariantsDialog}
          contentText={state.contentText}
          trainVariants={state.trainVariants}
          onClose={handleDialogClose}
          onConfirm={handleTrainVariantsConfirm}
          title={state.title}
          repertoireId={state.repertoireId}
        />
      )}
      {state.openSelectNextMoveDialog && (
        <SelectNextMoveDialog
          open={state.openSelectNextMoveDialog}
          nextMovements={state.nextMovements}
          selectedVariantMove={state.selectedVariantMove}
          onClose={handleDialogClose}
          onConfirm={handleNextMoveConfirm}
          title={state.title}
        />
      )}
      {state.openRepertoireDialog && (
        <RepertoireDialog
          open={state.openRepertoireDialog}
          contentText={state.contentText}
          repertoires={state.repertoires}
          onClose={handleDialogClose}
          onConfirm={handleRepertoireConfirm}
          title={state.title}
        />
      )}
      {state.openSelectVariantsDialog && (
        <SelectVariantsDialog
          open={state.openSelectVariantsDialog}
          contentText={state.contentText}
          variants={state.variants}
          repertoireId={state.repertoireId}
          onClose={handleDialogClose}
          onConfirm={handleVariantsConfirm}
          title={state.title}
        />
      )}
      {state.numberDialogProps && (
        <NumberDialog
          open={state.openNumberDialog}
          title={state.numberDialogProps.title}
          contentText={state.numberDialogProps.contentText}
          min={state.numberDialogProps.min}
          max={state.numberDialogProps.max}
          initialValue={state.numberDialogProps.initialValue}
          onNumberConfirm={handleNumberConfirm}
          onClose={handleDialogClose}
        />
      )}
    </DialogContext.Provider>
  );
};
