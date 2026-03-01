import React from "react";
import { cn } from "../../../utils/cn";

interface PageSurfaceProps {
  children: React.ReactNode;
  className?: string;
}

export const PageSurface: React.FC<PageSurfaceProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "w-full h-full min-h-0 self-stretch bg-page rounded-none sm:rounded-xl shadow-elevated flex flex-col overflow-hidden border border-border-subtle",
        className
      )}
    >
      {children}
    </div>
  );
};
