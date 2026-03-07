import React from "react";
import VariantActionButton from "./VariantActionButton";

interface VariantActionButtonsProps {
  actions: {
    onClick: () => void;
    icon: React.ReactElement;
    label: string;
  }[];
}

const VariantActionButtons: React.FC<VariantActionButtonsProps> = ({ actions }) => {
  return (
    <div className="mb-3 flex max-w-full flex-wrap items-center gap-2">
      {actions.map((action, index) => (
        <VariantActionButton
          key={`${action.label}-${index}`}
          onClick={action.onClick}
          icon={action.icon}
          label={action.label}
        />
      ))}
    </div>
  );
};

export default VariantActionButtons;
