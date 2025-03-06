import { ComputerDesktopIcon } from "@heroicons/react/24/outline";
import React from "react";

export interface StockfishLabelProps {
    depth: number;
    maxDepth: number;
    enabled: boolean;
}

export const StockfishLabel: React.FC<StockfishLabelProps> = ({ depth, maxDepth, enabled }) => (
    <div className="flex items-center">
        <ComputerDesktopIcon className="h-5 w-5 text-blue-400" />
        {enabled && (
            <div className="flex items-center ml-1">
                <span className="text-sm font-medium hidden sm:inline mr-1">Engine</span>
                <span className="text-xs bg-slate-700 px-1.5 py-0.5 rounded-md text-blue-300 font-mono">
                    {depth}/{maxDepth}
                </span>
            </div>
        )}
    </div>
);