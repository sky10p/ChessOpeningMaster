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
  const badgeVariant = delta > 0 ? "success" : delta < 0 ? "warning" : "brand";
  const deltaLabel =
    delta > 0 ? `+${delta} pts` : delta < 0 ? `${delta} pts` : "No change";
  const summaryLabel =
    delta > 0
      ? `Mastery improved by ${delta} points`
      : delta < 0
      ? `Mastery dropped by ${Math.abs(delta)} points`
      : "Mastery stayed the same";

  return (
    <Card className="border-border-default bg-surface-raised" padding="compact">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs text-text-subtle">Mastery Impact</p>
          <p className="text-sm font-semibold text-text-base">
            {summaryLabel}
          </p>
          <p className="text-xs text-text-muted">
            Before {before}% • Now {after}%
          </p>
        </div>
        <Badge variant={badgeVariant} size="sm">
          {deltaLabel}
        </Badge>
      </div>
    </Card>
  );
};
