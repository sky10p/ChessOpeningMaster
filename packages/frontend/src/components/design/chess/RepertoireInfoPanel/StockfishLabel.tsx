import { ComputerDesktopIcon } from "@heroicons/react/24/outline";
import React from "react";

export interface StockfishLabelProps {
    depth: number;
    maxDepth: number;
    enabled: boolean;
}

export const StockfishLabel: React.FC<StockfishLabelProps> = ({ depth, maxDepth, enabled }) => (
    <span className="flex flex-col items-center">
        <ComputerDesktopIcon className="h-6 w-6" /> {enabled ? `${depth}/${maxDepth}` : ""}
    </span>
);