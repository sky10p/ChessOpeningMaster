import { IMoveNode } from "./MoveNode";

export interface IRepertoire {
    _id: string;
    name: string;
    moveNodes: IMoveNode;
}