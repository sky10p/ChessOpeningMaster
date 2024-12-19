export interface LichessResponse {
  white: number;
  draws: number;
  black: number;
  moves: MoveLichess[];
  topGames: LichessGame[];
  opening: Opening | null;
}

export interface MoveLichess {
  uci: string;
  san: string;
  averageRating: number;
  white: number;
  draws: number;
  black: number;
  game: null;
  opening: Opening;
}

export interface Opening {
  eco: string;
  name: string;
}

export interface LichessGame {
  uci: string;
  id: string;
  winner: string | null;
  black: Player;
  white: Player;
  year: number;
  month: string;
}

interface Player {
  name: string;
  rating: number;
}

export enum LichessMovesTypes {
  MASTERS = 'masters',
  LICHESS = 'lichess'
}
  

export async function getLichessMoves(fen: string, type: LichessMovesTypes, ratings: number[] = [400, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2500]): Promise<LichessResponse> {
  try {
    let url = `https://explorer.lichess.ovh/${type}?fen=${fen}`;
    if (type === LichessMovesTypes.LICHESS) {
      url += `&ratings=${ratings.join(',')}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data: LichessResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching moves from Lichess', error);
    return {
      white: 0,
      draws: 0,
      black: 0,
      moves: [],
      topGames: [],
      opening: null
    };
  }
}