import React from "react";
import { RepertoireInfoActionButton } from "./RepertoireInfoActionButton";
import { RepertoireInfoAction } from "./model";

// Define props interface
interface RepertoireInfoActionsProps {
  actions: RepertoireInfoAction[];
  moreOptionsAction?: RepertoireInfoAction;
}

export const RepertoireInfoActions: React.FC<RepertoireInfoActionsProps> = ({ actions, moreOptionsAction }) => {
  return (
    <div className="overflow-x-auto w-full flex justify-end items-center gap-2 pb-2 px-2">
      <div className="flex items-center justify-end gap-2">
        {actions.map((action, index) => (
          <RepertoireInfoActionButton
            key={index}
            onClick={action.onClick}
            icon={action.icon}
            label={action.label}
          />
        ))}
      </div>
      {moreOptionsAction && (
        <RepertoireInfoActionButton
          onClick={moreOptionsAction.onClick}
          icon={moreOptionsAction.icon}
        />
      )}
    </div>
  );
};
