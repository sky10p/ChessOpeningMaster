import React from "react";
import { Button, IconButton } from "../../../../ui";
import { cn } from "../../../../../utils/cn";

interface RepertoireInfoActionButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  icon: React.ReactElement;
  label?: string;
  className?: string;
  iconOnly?: boolean;
  intent?: "primary" | "secondary" | "danger" | "ghost" | "accent" | "outline";
}

export const RepertoireInfoActionButton: React.FC<RepertoireInfoActionButtonProps> = ({
  onClick,
  icon,
  label,
  className,
  iconOnly = false,
  intent = "secondary",
}) => {
  if (iconOnly) {
    return (
      <IconButton label={label ?? "Action"} onClick={onClick} className={cn("border border-border-default bg-surface-raised text-text-muted hover:bg-interactive hover:text-text-base", className)}>
        {icon}
      </IconButton>
    );
  }

  return (
    <div className={cn("min-w-0", className)}>
      <Button intent={intent} size="sm" onClick={onClick} className="w-full justify-center gap-2 truncate">
        <span className="shrink-0">{icon}</span>
        {label ? <span className="truncate">{label}</span> : null}
      </Button>
    </div>
  );
};
