import React from "react";
import { Button } from "../../../ui";

interface VariantActionButtonProps {
  onClick: () => void;
  icon: React.ReactElement;
  label?: string;
}

const VariantActionButton: React.FC<VariantActionButtonProps> = ({
  onClick,
  icon,
  label,
}) => (
  <div className="min-w-0">
    <Button onClick={onClick} intent="secondary" size="sm" className="w-full justify-center gap-2">
      <span className="shrink-0">{icon}</span>
      {label ? <span className="truncate">{label}</span> : null}
    </Button>
  </div>
);

export default VariantActionButton;
