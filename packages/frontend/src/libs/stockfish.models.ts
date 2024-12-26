export interface Line {
  evaluation: number;
  moves: string[];
}

export interface StockfishData {
  lines: Line[];
  depth: number;
  time: number;
  maxDepth: number;
}
