import React from "react";
import { Story } from "@ladle/react";
import theme from "../../../design/theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { StockfishPanel } from "./StockfishPanel";

const Container: React.FC<{ width: string; children: React.ReactNode }> = ({
  width,
  children,
}) => <div style={{ width }}>{children}</div>;

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
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Container width="600px">
      <StockfishPanel {...defaultArgs} />
    </Container>
  </ThemeProvider>
);

export const StockfishPanelStoryCustomPosition: Story = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Container width="600px">
      <StockfishPanel {...customPositionArgs} />
    </Container>
  </ThemeProvider>
);
