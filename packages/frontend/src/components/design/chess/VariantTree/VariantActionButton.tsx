import React from "react";

interface VariantActionButtonProps {
  onClick: () => void;
  icon: React.ReactElement;
  label: string;
}

const VariantActionButton: React.FC<VariantActionButtonProps> = ({
  onClick,
  icon,
  label,
}) => (
  <div className="flex flex-col items-center">
    <button onClick={onClick} className="text-gray-700 my-2">
      {icon}
    </button>
    <span className="text-xs text-center truncate">
      {label}
    </span>
  </div>
);

export default VariantActionButton;