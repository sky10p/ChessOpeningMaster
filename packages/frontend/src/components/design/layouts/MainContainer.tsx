import React from "react";

const contentStyles: React.CSSProperties = {
    flexGrow: 1,
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  };

  export const MainContainer = ({ children }: { children: React.ReactNode }) => {
    return (
      <main style={contentStyles}>
        {children}
      </main>
    );
  }