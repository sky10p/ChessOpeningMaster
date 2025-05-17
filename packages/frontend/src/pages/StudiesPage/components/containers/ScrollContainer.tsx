import React from "react";

interface ScrollContainerProps {
  children: React.ReactNode;
  className?: string;
}

const ScrollContainer: React.FC<ScrollContainerProps> = ({ children, className = "" }) => {
  return (
    <div className={`h-full overflow-y-auto pb-6 ${className}`}>
      {children}
    </div>
  );
};

export default ScrollContainer;
