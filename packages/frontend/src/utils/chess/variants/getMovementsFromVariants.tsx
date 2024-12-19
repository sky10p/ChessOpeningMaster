import { TrainVariant } from "../../../models/chess.models";
import { MoveVariantNode } from "../../../models/VariantNode";

export const getMovementsFromVariant = (variant: TrainVariant, movement: MoveVariantNode): string[] => {
    const { moves } = variant.variant;
    const { position: numberTurn } = movement;

    const movementsToShow = moves.slice(numberTurn, numberTurn + 6).map(move => move.getMove().san);
    return numberTurn === 0 ? movementsToShow : ["...", ...movementsToShow];
};