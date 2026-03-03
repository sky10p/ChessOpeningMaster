import React from "react";
import { Badge } from "../../../components/ui";

interface RepertoireOverviewHeaderProps {
  repertoireCount: number;
  openingCount: number;
  dueVariantsCount: number;
  dueMistakesCount: number;
}

export const RepertoireOverviewHeader: React.FC<RepertoireOverviewHeaderProps> = ({
  repertoireCount,
  openingCount,
  dueVariantsCount,
  dueMistakesCount,
}) => (
  <header className="shrink-0 border-b border-border-default bg-surface px-4 py-3 sm:px-5">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold text-text-base">Repertoires</h1>
        <p className="mt-1 max-w-3xl text-sm text-text-muted">
          Browse your repertoires, manage favourites and disabled lines, and jump into opening
          review or active training.
        </p>
      </div>
      <div className="flex flex-wrap gap-2 lg:justify-end">
        <Badge variant="default" size="lg" className="bg-surface-raised text-text-base">
          {repertoireCount} active repertoires
        </Badge>
        <Badge variant="info" size="lg">
          {openingCount} openings
        </Badge>
        <Badge variant="warning" size="lg">
          {dueVariantsCount} due variants
        </Badge>
        <Badge variant="danger" size="lg">
          {dueMistakesCount} due mistakes
        </Badge>
      </div>
    </div>
  </header>
);
