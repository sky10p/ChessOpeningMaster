import React from "react";

export const MainContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex-grow p-1 sm:p-4 flex flex-col items-center justify-center bg-background h-screen-dynamic overflow-hidden">
      {children}
    </main>
  );
};