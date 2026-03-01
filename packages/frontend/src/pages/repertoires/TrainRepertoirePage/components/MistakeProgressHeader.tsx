import React from "react";
import { Badge, Card } from "../../../../components/ui";

interface MistakeProgressHeaderProps {
  solved: number;
  total: number;
}

export const MistakeProgressHeader: React.FC<MistakeProgressHeaderProps> = ({
  solved,
  total,
}) => {
  const current = Math.min(total, solved + 1);
  const percentage = total === 0 ? 100 : Math.round((solved / total) * 100);

  return (
    <Card className="border-border-default bg-surface" padding="compact">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-text-subtle">Mistake Reinforcement</p>
          <p className="text-sm font-semibold text-text-base">
            Mistake {current}/{Math.max(total, 1)}
          </p>
        </div>
        <Badge variant="brand" size="sm">
          {percentage}%
        </Badge>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-interactive">
        <div
          className="h-2 rounded-full bg-brand transition-all"
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>
    </Card>
  );
};
