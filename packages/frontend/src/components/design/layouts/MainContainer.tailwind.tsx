import React from "react";

export const MainContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex-grow p-4 flex flex-col items-center justify-center scrollbar-custom bg-background">
      {children}
    </main>
  );
};