import React from "react";
import { Badge, Card } from "../../../../components/ui";

interface MasteryDeltaCardProps {
  before: number;
  after: number;
}

export const MasteryDeltaCard: React.FC<MasteryDeltaCardProps> = ({
  before,
  after,
}) => {
  const delta = after - before;
  const badgeVariant = delta >= 0 ? "success" : "warning";
  const deltaLabel = delta >= 0 ? `+${delta}` : `${delta}`;

  return (
    <Card className="border-border-default bg-surface-raised" padding="compact">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs text-text-subtle">Mastery</p>
          <p className="text-sm text-text-base">
            {before}% to {after}%
          </p>
        </div>
        <Badge variant={badgeVariant} size="sm">
          {deltaLabel}
        </Badge>
      </div>
    </Card>
  );
};
