import React, { useEffect } from "react";
import { Turn } from "../../common/types/Orientation";
import { useRepertoireContext } from "./RepertoireContext";
import { MoveVariantNode } from "../components/chess/utils/VariantNode";

interface TrainRepertoireContextProps {
    turn: Turn;
    isYourTurn: boolean;
    allowedMoves: MoveVariantNode[];
    playOpponentMove: (lastMove: MoveVariantNode) => void;
    finishedTrain: boolean;
}

export const TrainRepertoireContext = React.createContext<TrainRepertoireContextProps | null>(null);

export const useTrainRepertoireContext = () => {
    const context = React.useContext(TrainRepertoireContext);

    if (!context) {
        throw new Error(
            "useTrainRepertoireContext must be used within a TrainRepertoireContextProvider"
        );
    }

    return context;
}

interface TrainRepertoireContextProviderProps {
    children: React.ReactNode;
}

const sleep = async (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export const TrainRepertoireContextProvider: React.FC<TrainRepertoireContextProviderProps> = ({
    children,
}) => {
    const [turn, setTurn] = React.useState<Turn>("white");
    const {orientation, currentMoveNode, goToMove, initBoard} = useRepertoireContext();
    const [allowedMoves, setAllowedMoves] = React.useState<MoveVariantNode[]>([]); 
    const notFinishedVariants = true;
    
    useEffect(()=>{
        setTurn(currentMoveNode.move?.color ==="w" ? "black" : "white")
    }, [currentMoveNode]);

    useEffect(()=>{
        setAllowedMoves(currentMoveNode.children);
    }, [turn]);

    const playOpponentMove = async (lastMove: MoveVariantNode) => {
        await sleep(2000);
        const randomMove = Math.floor(Math.random() * lastMove.children.length);
        goToMove(lastMove.children[randomMove]);
    };

    const isFinishedTrain = () => {
        return allowedMoves.length === 0;
    }

    if(isFinishedTrain() && notFinishedVariants){
        initBoard();
    }

    const isYourTurn = turn === orientation;

    return (
        <TrainRepertoireContext.Provider value={{ turn, isYourTurn, allowedMoves, playOpponentMove, finishedTrain: isFinishedTrain() }}>
            {children}
        </TrainRepertoireContext.Provider>
    );
};
