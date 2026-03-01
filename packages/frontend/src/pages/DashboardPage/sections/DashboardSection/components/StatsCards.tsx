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
      <div className="bg-surface rounded-lg p-4 shadow border border-border-subtle flex flex-col items-center">
        <span className="text-3xl font-bold text-brand">
          {totalRepertoires}
        </span>
        <span className="text-text-muted mt-1">Total Repertoires</span>
      </div>
      <div className="bg-surface rounded-lg p-4 shadow border border-border-subtle flex flex-col items-center">
        <span className="text-3xl font-bold text-warning">
          {totalVariants}
        </span>
        <span className="text-text-muted mt-1">Total Variants</span>
      </div>
      <div className="bg-surface rounded-lg p-4 shadow border border-border-subtle flex flex-col items-center">
        <span className="text-3xl font-bold text-accent truncate max-w-full">
          {mostRecentName || "-"}
        </span>
        <span className="text-text-muted mt-1">Most Recently Updated</span>
      </div>
    </div>
  );
};
