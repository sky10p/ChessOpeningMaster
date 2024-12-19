/* eslint-disable @typescript-eslint/no-empty-function */
import React from "react";
import { TextDialog } from "../components/design/dialogs/TextDialog";
import { ConfirmDialog } from "../components/design/dialogs/ConfirmDialog";
import SelectTrainVariantsDialog from "../components/design/dialogs/SelectTrainVariantsDialog";
import { TrainVariant, Variant } from "../models/chess.models";
import SelectNextMoveDialog from "../components/design/dialogs/SelectNextMoveDialog";
import RepertoireDialog from "../components/design/dialogs/RepertoireDialog"; // Import RepertoireDialog
import { IRepertoire } from "../../../common/src/types/Repertoire"; // Import IRepertoire
import SelectVariantsDialog from "../components/design/dialogs/SelectVariantsDialog";
import { NumberDialog } from "../components/design/dialogs/NumberDialog"; // Import NumberDialog

interface TextDialogProps {
  title: string;
  contentText: string;
  onTextConfirm: (text: string) => void;
  onDialogClose?: () => void;
}

interface ConfirmDialog {
  title?: string;
  contentText?: string;
  onConfirm: () => void;
  onDialogClose?: () => void;
}

interface SelectTrainVariantsConfirmDialog {
  title?: string;
  contentText?: string;
  trainVariants: TrainVariant[];
  repertoireId: string; // Add repertoireId
  onTrainVariantsConfirm: (trainVariants: TrainVariant[]) => void;
  onDialogClose?: () => void;
}

interface SelectVariantsConfirmDialog {
  title?: string;
  contentText?: string;
  variants: Variant[];
  onVariantsConfirm: (variants: Variant[]) => void;
  onDialogClose?: () => void;
}

interface SelectNextMoveDialog {
  title?: string;
  contentText?: string;
  nextMovements: string[];
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
  onDialogClose?: () => void;
}

interface DialogContextProps {
  showTextDialog: (props: TextDialogProps) => void;
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
      "useAlertContext must be used within a AlertContextProvider"
    );
  }

  return context;
};

export const DialogContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [openTextDialog, setOpenTextDialog] = React.useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = React.useState(false);
  const [openTrainVariantsDialog, setOpenTrainVariantsDialog] =
    React.useState(false);
  const [openSelectNextMoveDialog, setOpenSelectNextMoveDialog] =
    React.useState(false);
  const [openRepertoireDialog, setOpenRepertoireDialog] = React.useState(false); // Add state for RepertoireDialog
  const [openSelectVariantsDialog, setOpenSelectVariantsDialog] =
    React.useState(false); // Add state for SelectVariantsConfirmDialog
  const [openNumberDialog, setOpenNumberDialog] = React.useState(false);
  const [numberDialogProps, setNumberDialogProps] =
    React.useState<NumberDialogProps | null>(null);
  const [title, setTitle] = React.useState<string>("");

  const [onTextConfirm, setOnTextConfirm] = React.useState<
    (text: string) => void
  >(() => {});
  const [onConfirm, setOnConfirm] = React.useState<() => void>(() => {});
  const [onTrainVariantsConfirm, setOnTrainVariantsConfirm] = React.useState<
    (trainVariants: TrainVariant[]) => void
  >(() => {});
  const [onNextMoveConfirm, setOnNextMoveConfirm] = React.useState<
    (nextMove: string) => void
  >(() => {});
  const [onRepertoireConfirm, setOnRepertoireConfirm] = React.useState<
    (repertoire: IRepertoire) => void
  >(() => {}); // Add state for onRepertoireConfirm
  const [onVariantsConfirm, setOnVariantsConfirm] = React.useState<
    (variants: Variant[]) => void
  >(() => {}); // Add state for onVariantsConfirm
  const [onDialogClose, setOnDialogClose] = React.useState<
    (() => void) | undefined
  >(() => {});

  const [trainVariants, setTrainVariants] = React.useState<TrainVariant[]>([]);
  const [nextMovements, setNextMovements] = React.useState<string[]>([]);
  const [repertoires, setRepertoires] = React.useState<IRepertoire[]>([]);
  const [variants, setVariants] = React.useState<Variant[]>([]);
  const [repertoireId, setRepertoireId] = React.useState<string>("");

  const [contentText, setContentText] = React.useState<string>("");

  const showTextDialog = ({
    title,
    contentText,
    onTextConfirm,
    onDialogClose,
  }: TextDialogProps) => {
    setTitle(title);
    setContentText(contentText);
    setOnTextConfirm(() => onTextConfirm);
    setOnDialogClose(() => onDialogClose);
    setOpenTextDialog(true);
  };

  const showConfirmDialog = ({
    title,
    contentText,
    onConfirm,
    onDialogClose,
  }: ConfirmDialog) => {
    setTitle(title ?? "Confirm operation");
    setContentText(contentText ?? "Are you sure?");
    setOnConfirm(() => onConfirm);
    setOnDialogClose(() => onDialogClose);
    setOpenConfirmDialog(true);
  };

  const showTrainVariantsDialog = ({
    title,
    contentText,
    trainVariants,
    repertoireId,
    onTrainVariantsConfirm,
    onDialogClose,
  }: SelectTrainVariantsConfirmDialog) => {
    setTitle(title ?? "Select train variants");
    setContentText(
      contentText ?? "Select variants to train or disable to ignore"
    );
    setOnTrainVariantsConfirm(() => onTrainVariantsConfirm);
    setTrainVariants(trainVariants);
    setRepertoireId(repertoireId); // Set repertoireId
    setOnDialogClose(() => onDialogClose);
    setOpenTrainVariantsDialog(true);
  };

  const showSelectNextMoveDialog = ({
    title,
    contentText,
    nextMovements,
    onNextMoveConfirm,
    onDialogClose,
  }: SelectNextMoveDialog) => {
    setTitle(title ?? "Select next move");
    setContentText(contentText ?? "Select the movement to play");
    setNextMovements(nextMovements);
    setOnNextMoveConfirm(() => onNextMoveConfirm);
    setOnDialogClose(() => onDialogClose);
    setOpenSelectNextMoveDialog(true);
  };

  const showRepertoireDialog = ({
    title,
    contentText,
    repertoires,
    onConfirm,
    onDialogClose,
  }: RepertoireDialogProps) => {
    setTitle(title);
    setContentText(contentText);
    setRepertoires(repertoires);
    setOnRepertoireConfirm(() => onConfirm);
    setOnDialogClose(() => onDialogClose);
    setOpenRepertoireDialog(true);
  };

  const showSelectVariantsDialog = ({
    title,
    contentText,
    variants,
    onVariantsConfirm,
    onDialogClose,
  }: SelectVariantsConfirmDialog) => {
    setTitle(title ?? "Select variants");
    setContentText(contentText ?? "Select the variants to confirm");
    setVariants(variants);
    setOnVariantsConfirm(() => onVariantsConfirm);
    setOnDialogClose(() => onDialogClose);
    setOpenSelectVariantsDialog(true);
  };

  const showNumberDialog = ({
    title,
    contentText,
    min,
    max,
    initialValue,
    onNumberConfirm,
    onDialogClose,
  }: NumberDialogProps) => {
    setNumberDialogProps({
      title,
      contentText,
      min,
      max,
      initialValue,
      onNumberConfirm,
      onDialogClose,
    });
    setOpenNumberDialog(true);
  };

  const handleDialogClose = () => {
    setOpenConfirmDialog(false);
    setOpenTextDialog(false);
    setOpenTrainVariantsDialog(false);
    setOpenSelectNextMoveDialog(false);
    setOpenRepertoireDialog(false); // Close RepertoireDialog
    setOpenSelectVariantsDialog(false);
    setOpenNumberDialog(false);
    numberDialogProps?.onDialogClose?.();
    onDialogClose && onDialogClose();
  };

  const handleTextConfirm = (text: string) => {
    setOpenTextDialog(false);
    onTextConfirm(text);
  };

  const handleConfirm = () => {
    setOpenConfirmDialog(false);
    onConfirm();
  };

  const handleTrainVariantsConfirm = (trainVariants: TrainVariant[]) => {
    setOpenTrainVariantsDialog(false);
    onTrainVariantsConfirm(trainVariants);
  };

  const handleNextMoveConfirm = (nextMove: string) => {
    setOpenSelectNextMoveDialog(false);
    onNextMoveConfirm(nextMove);
  };

  const handleRepertoireConfirm = (repertoire: IRepertoire) => {
    setOpenRepertoireDialog(false);
    onRepertoireConfirm(repertoire);
  };

  const handleVariantsConfirm = (variants: Variant[]) => {
    setOpenSelectVariantsDialog(false);
    onVariantsConfirm(variants);
  };

  const handleNumberConfirm = (number: number) => {
    if (numberDialogProps && numberDialogProps.onNumberConfirm) {
      setOpenNumberDialog(false);
      numberDialogProps.onNumberConfirm(number);
    }
  };

  return (
    <DialogContext.Provider
      value={{
        showTextDialog,
        showConfirmDialog,
        showTrainVariantsDialog,
        showSelectNextMoveDialog,
        showRepertoireDialog,
        showSelectVariantsDialog,
        showNumberDialog,
      }}
    >
      {children}
      <TextDialog
        open={openTextDialog}
        initialValue=""
        onClose={handleDialogClose}
        contentText={contentText}
        onTextConfirm={handleTextConfirm}
        title={title}
      ></TextDialog>
      <ConfirmDialog
        open={openConfirmDialog}
        onClose={handleDialogClose}
        contentText={contentText}
        onConfirm={handleConfirm}
        title={title}
      ></ConfirmDialog>
      <SelectTrainVariantsDialog
        open={openTrainVariantsDialog}
        contentText={contentText}
        trainVariants={trainVariants}
        onClose={handleDialogClose}
        onConfirm={handleTrainVariantsConfirm}
        title={title}
        repertoireId={repertoireId}
      ></SelectTrainVariantsDialog>
      <SelectNextMoveDialog
        open={openSelectNextMoveDialog}
        contentText={contentText}
        nextMovements={nextMovements}
        onClose={handleDialogClose}
        onConfirm={handleNextMoveConfirm}
        title={title}
      ></SelectNextMoveDialog>
      <RepertoireDialog
        open={openRepertoireDialog}
        contentText={contentText}
        repertoires={repertoires}
        onClose={handleDialogClose}
        onConfirm={handleRepertoireConfirm}
        title={title}
      ></RepertoireDialog>
      <SelectVariantsDialog
        open={openSelectVariantsDialog}
        contentText={contentText}
        variants={variants}
        onClose={handleDialogClose}
        onConfirm={handleVariantsConfirm}
        title={title}
      ></SelectVariantsDialog>
      {numberDialogProps && (
        <NumberDialog
          open={openNumberDialog}
          title={numberDialogProps.title}
          contentText={numberDialogProps.contentText}
          min={numberDialogProps.min}
          max={numberDialogProps.max}
          initialValue={numberDialogProps.initialValue}
          onNumberConfirm={handleNumberConfirm}
          onClose={handleDialogClose}
        />
      )}
    </DialogContext.Provider>
  );
};
