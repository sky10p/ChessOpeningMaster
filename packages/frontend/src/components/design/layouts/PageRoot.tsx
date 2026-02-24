import React from "react";
import { cn } from "../../../utils/cn";

interface PageRootProps {
  children: React.ReactNode;
  className?: string;
}

export const PageRoot: React.FC<PageRootProps> = ({ children, className }) => {
  return (
    <div className={cn("w-full h-full overflow-y-auto bg-page text-text-base", className)}>
      {children}
    </div>
  );
};
