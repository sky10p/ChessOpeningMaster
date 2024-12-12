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

export async function getLichessMoves(fen: string, type: 'players' | 'masters'): Promise<LichessResponse> {
  try {
    const response = await fetch(`https://explorer.lichess.ovh/${type}?fen=${fen}`);
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