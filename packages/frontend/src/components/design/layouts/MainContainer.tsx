import React from "react";

export const MainContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {children}
    </main>
  );
};
