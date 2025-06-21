export class Chess {
  private currentFen: string;
  private moveHistory: string[] = [];
  
  constructor(fen?: string) {
    this.currentFen = fen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  }
  
  fen() {
    return this.currentFen;
  }
  
  load(fen: string) {
    this.currentFen = fen;
    return true;
  }
  
  loadPgn(_pgn: string) {
    return true;
  }
  
  pgn() {
    return "1. e4";
  }
  
  history() {
    return this.moveHistory;
  }
  
  move(move: string) {
    this.moveHistory.push(move);
    // Simple mock: change FEN based on common test moves
    if (move === 'e4') {
      this.currentFen = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1";
    } else if (move === 'e5') {
      this.currentFen = "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2";
    } else if (move === 'c5') {
      this.currentFen = "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2";
    }
    return { san: move };
  }
  
  undo() {
    if (this.moveHistory.length > 0) {
      const lastMove = this.moveHistory.pop();
      // Simplified undo: just return to starting position for simplicity
      this.currentFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      return { san: lastMove || "" };
    }
    return null;
  }
}

export const WHITE = 'w';
export const BLACK = 'b';
