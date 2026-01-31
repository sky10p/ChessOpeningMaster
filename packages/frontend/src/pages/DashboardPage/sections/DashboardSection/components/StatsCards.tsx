import React from "react";

interface StatsCardsProps {
  totalRepertoires: number;
  totalVariants: number;
  mostRecentName: string | null;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  totalRepertoires,
  totalVariants,
  mostRecentName,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <div className="bg-gray-900 rounded-lg p-4 shadow border border-gray-800 flex flex-col items-center">
        <span className="text-3xl font-bold text-blue-400">
          {totalRepertoires}
        </span>
        <span className="text-gray-300 mt-1">Total Repertoires</span>
      </div>
      <div className="bg-gray-900 rounded-lg p-4 shadow border border-gray-800 flex flex-col items-center">
        <span className="text-3xl font-bold text-amber-400">
          {totalVariants}
        </span>
        <span className="text-gray-300 mt-1">Total Variants</span>
      </div>
      <div className="bg-gray-900 rounded-lg p-4 shadow border border-gray-800 flex flex-col items-center">
        <span className="text-3xl font-bold text-purple-400">
          {mostRecentName || "-"}
        </span>
        <span className="text-gray-300 mt-1">Most Recently Updated</span>
      </div>
    </div>
  );
};
