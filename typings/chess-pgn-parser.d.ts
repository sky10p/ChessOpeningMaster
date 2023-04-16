// typings/chess-pgn-parser.d.ts

declare module "chess-pgn-parser" {
    export interface PGN {
        headers: {
            [key: string]: string;
        };
        moves: string[];
    }
    export function parse(pgn: string): PGN;

  }
  