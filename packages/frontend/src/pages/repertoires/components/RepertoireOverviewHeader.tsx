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
    <div className="flex items-center gap-3">
      <h1 className="shrink-0 text-2xl font-semibold text-text-base">Repertoires</h1>
      <div className="flex gap-2 overflow-x-auto pb-0.5">
        <Badge variant="default" size="sm" className="shrink-0 bg-surface-raised text-text-base">
          {repertoireCount} active repertoires
        </Badge>
        <Badge variant="info" size="sm" className="shrink-0">
          {openingCount} openings
        </Badge>
        <Badge variant="warning" size="sm" className="shrink-0">
          {dueVariantsCount} due variants
        </Badge>
        <Badge variant="danger" size="sm" className="shrink-0">
          {dueMistakesCount} due mistakes
        </Badge>
      </div>
    </div>
  </header>
);
