import React from "react";
import { cn } from "../../../utils/cn";

interface PageFrameProps {
  children: React.ReactNode;
  className?: string;
  maxWidthClass?: string;
}

export const PageFrame: React.FC<PageFrameProps> = ({
  children,
  className,
  maxWidthClass = "max-w-[88rem]",
}) => {
  return (
    <div className={cn("mx-auto w-full px-0 sm:px-4", maxWidthClass, className)}>
      {children}
    </div>
  );
};
