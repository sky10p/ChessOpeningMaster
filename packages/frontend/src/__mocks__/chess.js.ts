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
  
  loadPgn() {
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
    
    // Simple mapping for common test moves (SAN to LAN)
    const sanToLan: { [key: string]: string } = {
      'e4': 'e2e4',
      'e5': 'e7e5',
      'Nf3': 'g1f3',
      'Nc6': 'b8c6',
      'Bb5': 'f1b5',
      'd4': 'd2d4',
      'd5': 'd7d5',
      'c4': 'c2c4',
      'c5': 'c7c5',
      'Nf6': 'g8f6',
      'Nc3': 'b1c3',
    };
    
    const lan = sanToLan[move] || `unknown${move}`;
    
    // Simple mock: change FEN based on common test moves
    if (move === 'e4') {
      this.currentFen = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1";
    } else if (move === 'e5') {
      this.currentFen = "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2";
    } else if (move === 'c5') {
      this.currentFen = "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2";
    }
    
    return { 
      san: move,
      lan: lan,
      from: lan.substring(0, 2),
      to: lan.substring(2, 4),
      piece: 'p', // simplified for mock
      color: this.moveHistory.length % 2 === 1 ? 'w' : 'b'
    };
  }
  
  undo() {
    if (this.moveHistory.length > 0) {
      const lastMove = this.moveHistory.pop();
      this.currentFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      return { 
        san: lastMove || "",
        lan: "e2e4", // simplified for mock
        from: "e2",
        to: "e4",
        piece: 'p',
        color: 'w'
      };
    }
    return null;
  }

  reset() {
    this.currentFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    this.moveHistory = [];
  }

  board(): (null | { type: string; color: string })[][] {
    const pieceMap: { [key: string]: { type: string; color: string } } = {
      p: { type: 'p', color: 'b' },
      r: { type: 'r', color: 'b' },
      n: { type: 'n', color: 'b' },
      b: { type: 'b', color: 'b' },
      q: { type: 'q', color: 'b' },
      k: { type: 'k', color: 'b' },
      P: { type: 'p', color: 'w' },
      R: { type: 'r', color: 'w' },
      N: { type: 'n', color: 'w' },
      B: { type: 'b', color: 'w' },
      Q: { type: 'q', color: 'w' },
      K: { type: 'k', color: 'w' },
    };

    const fenParts = this.currentFen.split(' ');
    const rows = fenParts[0].split('/');

    return rows.map((row) => {
      const squares: (null | { type: string; color: string })[] = [];
      for (const char of row) {
        const num = parseInt(char, 10);
        if (!isNaN(num)) {
          for (let i = 0; i < num; i++) squares.push(null);
        } else {
          squares.push(pieceMap[char] || null);
        }
      }
      return squares;
    });
  }
}

export const WHITE = 'w';
export const BLACK = 'b';
