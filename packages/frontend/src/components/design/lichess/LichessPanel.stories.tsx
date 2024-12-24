import React from "react";
import { Story } from "@ladle/react";
import LichessPanel from "./LichessPanel";

import "../../../index.css"


const defaultArgs = {
  fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", // Initial chess position
};

const customPositionArgs = {
  fen: "r1bqkbnr/pppppppp/n7/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 2 2", // Custom position
};

export const LichessPanelStoryDefault: Story = () => (

    <div className="w-1/2 bg-background">
      <LichessPanel {...defaultArgs} />
    </div>

);

export const LichessPanelStoryCustomPosition: Story = () => (

    <div className="w-1/2 bg-background">
      <LichessPanel {...customPositionArgs} />
    </div>

);
