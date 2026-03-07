import React from "react";
import { RepertoireInfoActionButton } from "./RepertoireInfoActionButton";
import { RepertoireInfoAction } from "./model";

interface RepertoireInfoActionsProps {
  actions: RepertoireInfoAction[];
  moreOptionsAction?: RepertoireInfoAction;
}

export const RepertoireInfoActions: React.FC<RepertoireInfoActionsProps> = ({ actions, moreOptionsAction }) => {
  const [primaryAction, ...secondaryActions] = actions;

  return (
    <div className="flex w-full flex-wrap items-center justify-end gap-2">
      {primaryAction ? (
        <RepertoireInfoActionButton
          onClick={primaryAction.onClick}
          icon={primaryAction.icon}
          label={primaryAction.label}
          intent="accent"
          className="min-w-[8.5rem]"
        />
      ) : null}
      <div className="flex items-center justify-end gap-2">
        {secondaryActions.map((action, index) => (
          <RepertoireInfoActionButton
            key={`${action.label}-${index}`}
            onClick={action.onClick}
            icon={action.icon}
            label={action.label}
            iconOnly
          />
        ))}
      </div>
      {moreOptionsAction && (
        <RepertoireInfoActionButton
          onClick={moreOptionsAction.onClick}
          icon={moreOptionsAction.icon}
          label={moreOptionsAction.label}
          iconOnly
        />
      )}
    </div>
  );
};
