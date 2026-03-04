import { IMoveNode } from "./MoveNode";
import { TrainVariantInfo } from "./Variants";

export interface IRepertoire {
    _id: string;
    name: string;
    moveNodes: IMoveNode;
    orientation: "white" | "black";
    order: number;
    disabled?: boolean;
    favorite?: boolean;
}

export interface IRepertoireDashboard  extends IRepertoire {
    variantsInfo:TrainVariantInfo[];
}
