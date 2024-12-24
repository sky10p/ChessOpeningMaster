import React from "react";
import { Story } from "@ladle/react";
import { StockfishPanel } from "./StockfishPanel";

const defaultArgs = {
  fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", // Initial chess position
  numLines: 3,
};

const customPositionArgs = {
  fen: "r1bqkbnr/pppppppp/n7/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 2 2", // Custom position
  numLines: 3,
};

const stockfishWorker = new Worker("/stockfish/stockfish.js");

export const StockfishPanelStoryDefault: Story = () => (

    <div className="w-1/2 bg-background">
      <StockfishPanel {...defaultArgs} />
    </div>
);

export const StockfishPanelStoryCustomPosition: Story = () => (
    <div className="w-1/2 bg-background">
      <StockfishPanel {...customPositionArgs} />
    </div>
);
