import React from "react";
import { cn } from "../../utils/cn";
import { Button, type ButtonProps } from "./Button";

export interface IconButtonProps extends Omit<ButtonProps, "size" | "intent"> {
  label: string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, label, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        intent="ghost"
        size="sm"
        aria-label={label}
        className={cn("h-8 w-8 p-0 rounded-md", className)}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

IconButton.displayName = "IconButton";
