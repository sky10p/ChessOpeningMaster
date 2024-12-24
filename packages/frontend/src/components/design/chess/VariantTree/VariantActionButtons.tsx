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
    <div className="overflow-x-auto max-w-full mb-5 flex gap-2 items-center pb-2 px-2">
      {actions.map((action, index) => (
        <VariantActionButton
          key={index}
          onClick={action.onClick}
          icon={action.icon}
          label={action.label}
        />
      ))}
    </div>
  );
};

export default VariantActionButtons;