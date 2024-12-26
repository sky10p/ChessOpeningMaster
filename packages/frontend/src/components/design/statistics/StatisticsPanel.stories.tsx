import React from "react";
import { Story } from "@ladle/react";
import StatisticsPanel from "./StatisticsPanel";

import "../../../index.css"


const defaultArgs = {
  fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", // Initial chess position
};

const customPositionArgs = {
  fen: "r1bqkbnr/pppppppp/n7/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 2 2", // Custom position
};

export const StatisticsPanelStoryDefault: Story = () => (

    <div className="w-1/2 bg-background">
      <StatisticsPanel {...defaultArgs} />
    </div>

);

export const StatisticsPanelStoryCustomPosition: Story = () => (

    <div className="w-1/2 bg-background">
      <StatisticsPanel {...customPositionArgs} />
    </div>

);
