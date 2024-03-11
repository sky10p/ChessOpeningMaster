/* eslint-disable @typescript-eslint/no-empty-function */
import React from "react";
import { TextDialog } from "../components/basic/dialogs/TextDialog";
import { ConfirmDialog } from "../components/basic/dialogs/ConfirmDialog";
import SelectTrainVariantsDialog from "../components/basic/dialogs/SelectTrainVariantsDialog";
import { TrainVariant } from "../components/chess/models/chess.models";
import SelectNextMoveDialog from "../components/basic/dialogs/SelectNextMoveDialog";


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
    onTrainVariantsConfirm: (trainVariants: TrainVariant[]) => void;
    onDialogClose?: () => void;
}

interface SelectNextMoveDialog{
    title?: string;
    contentText?: string;
    nextMovements: string[];
    onNextMoveConfirm: (nextMove: string) => void;
    onDialogClose?: () => void;

}

interface DialogContextProps {
    showTextDialog: (props: TextDialogProps) => void;
    showConfirmDialog: (props: ConfirmDialog) => void;
    showTrainVariantsDialog: (props: SelectTrainVariantsConfirmDialog) => void;
    showSelectNextMoveDialog: (props: SelectNextMoveDialog) => void;
}

export const DialogContext = React.createContext<DialogContextProps | null>(null);

export const useDialogContext = (): DialogContextProps => {
    const context = React.useContext(DialogContext);

    if (context === null) {
        throw new Error("useAlertContext must be used within a AlertContextProvider");
    }

    return context;
};

export const DialogContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [openTextDialog, setOpenTextDialog] = React.useState(false);
    const [openConfirmDialog, setOpenConfirmDialog] = React.useState(false);
    const [openTrainVariantsDialog, setOpenTrainVariantsDialog] = React.useState(false);
    const [openSelectNextMoveDialog, setOpenSelectNextMoveDialog] = React.useState(false);
    const [title, setTitle ] = React.useState<string>("");

    const [onTextConfirm, setOnTextConfirm] = React.useState<(text: string)=>void>(()=>{});
    const [onConfirm, setOnConfirm] = React.useState<(()=>void)>(()=>{});
    const [onTrainVariantsConfirm, setOnTrainVariantsConfirm] = React.useState<((trainVariants: TrainVariant[])=>void)>(()=>{});
    const [onNextMoveConfirm, setOnNextMoveConfirm] = React.useState<((nextMove: string)=>void)>(()=>{});
    const [onDialogClose, setOnDialogClose] = React.useState<(()=>void) | undefined>(()=>{});

    const [trainVariants, setTrainVariants] = React.useState<TrainVariant[]>([]);
    const [nextMovements, setNextMovements] = React.useState<string[]>([]);

    const [contentText, setContentText] = React.useState<string>("");

    const showTextDialog = ({title, contentText, onTextConfirm, onDialogClose}: TextDialogProps) => {
        setTitle(title);
        setContentText(contentText);
        setOnTextConfirm(() => onTextConfirm);
        setOnDialogClose(() => onDialogClose);
        setOpenTextDialog(true);
    };

    const showConfirmDialog = ({title, contentText, onConfirm, onDialogClose}: ConfirmDialog) => {
        setTitle(title ?? "Confirm operation");
        setContentText(contentText ?? "Are you sure?");
        setOnConfirm(() => onConfirm);
        setOnDialogClose(() => onDialogClose);
        setOpenConfirmDialog(true);
    };

    const showTrainVariantsDialog = ({title, contentText, trainVariants, onTrainVariantsConfirm, onDialogClose}: SelectTrainVariantsConfirmDialog) => {
        setTitle(title ?? "Select train variants");
        setContentText(contentText ?? "Select variants to train or disable to ignore");
        setOnTrainVariantsConfirm(() => onTrainVariantsConfirm);
        setTrainVariants(trainVariants);
        setOnDialogClose(() => onDialogClose);
        setOpenTrainVariantsDialog(true);
    };

    const showSelectNextMoveDialog = ({title, contentText,nextMovements, onNextMoveConfirm, onDialogClose}: SelectNextMoveDialog) => {
        setTitle(title ?? "Select next move");
        setContentText(contentText ?? "Select the movement to play");
        setNextMovements(nextMovements);
        setOnNextMoveConfirm(() => onNextMoveConfirm);
        setOnDialogClose(() => onDialogClose);
        setOpenSelectNextMoveDialog(true);
    }

    const handleDialogClose = () => {
        setOpenConfirmDialog(false);
        setOpenTextDialog(false);
        setOpenTrainVariantsDialog(false);
        setOpenSelectNextMoveDialog(false);
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

    return (
        <DialogContext.Provider value={{ showTextDialog, showConfirmDialog, showTrainVariantsDialog, showSelectNextMoveDialog }}>
            {children}
           <TextDialog open={openTextDialog} initialValue="" onClose={handleDialogClose} contentText={contentText} onTextConfirm={handleTextConfirm} title={title}></TextDialog>
           <ConfirmDialog open={openConfirmDialog} onClose={handleDialogClose} contentText={contentText} onConfirm={handleConfirm} title={title}></ConfirmDialog>
           <SelectTrainVariantsDialog open={openTrainVariantsDialog} contentText={contentText} trainVariants={trainVariants} onClose={handleDialogClose} onConfirm={handleTrainVariantsConfirm} title={title}></SelectTrainVariantsDialog>
           <SelectNextMoveDialog open={openSelectNextMoveDialog} contentText={contentText} nextMovements={nextMovements} onClose={handleDialogClose} onConfirm={handleNextMoveConfirm} title={title}></SelectNextMoveDialog>
        </DialogContext.Provider>
    );
};