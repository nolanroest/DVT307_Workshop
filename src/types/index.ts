// Utility types for difficulty levels and game status
export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameStatus = 'playing' | 'won' | 'lost';

// Core game interfaces
export interface Color {
  id: string;
  name: string;
  hex: string;
}

export interface GameConfig {
  difficulty: Difficulty;
  slots: number;
  maxAttempts: number;
  colors: Color[];
}

export interface GameState {
  secretCode: Color[];
  currentGuess: (Color | null)[];
  guesses: Guess[];
  gameStatus: GameStatus;
  attemptsRemaining: number;
  currentSlotIndex: number;
  canSubmit: boolean;
}

export interface CreateGameResponse {
  gameId: string;
  difficulty: Difficulty;
}

export interface GameStatusResponse {
  gameId: string;
  difficulty: Difficulty;
  guesses: Guess[];
  status: 'playing' | 'won' | 'lost';
  secretCode: Color[],
  attemptsRemaining: number;
}

export interface Guess {
  colors: Color[];
  feedback: Feedback;
}

export interface Feedback {
  correctPosition: number; // Black pegs - correct color in correct position
  correctColor: number;    // White pegs - correct color in wrong position
}

export interface GuessPayload {
  guess: Color[];
  gameId: string;
}

export interface FeedbackPayload {
  blackPegs: number;
  whitePegs: number;
  guessNumber: number;
  gameId: string;
  guess: Color[];
  gameStatus: GameStatus;
  secretCode: Color[];
}

// Statistics interfaces
export interface GameStats {
  totalGames: number;
  gamesWon: number;
  winPercentage: number;
  averageAttempts: number;
  statsByDifficulty: {
    [key in Difficulty]: DifficultyStats;
  };
}

export interface DifficultyStats {
  totalGames: number;
  gamesWon: number;
  winPercentage: number;
  averageAttempts: number;
}

// Leaderboard interfaces
export interface LeaderboardEntry {
  userId: string;
  difficulty: Difficulty;
  gamesWon: number;
  totalGames: number;
  bestScore: number;
  averageScore: number;
  lastWonAt: string;
  username?: string;
}

// API leaderboard response
export interface LeaderboardResponse {
  items: any[];
  count: number;
  lastEvaluatedKey?: string;
}

// Game listing interfaces
export interface GameListItem {
  gameId: string;
  difficulty: Difficulty;
  status: GameStatus;
  createdAt: string;
  updatedAt?: string;
  totalGuesses?: number;
}

export interface GameListResponse {
  games: GameListItem[];
  count: number;
  lastEvaluatedKey?: string;
}

// Leaderboard update payload - contains a single entry update
export interface LeaderboardUpdatePayload extends LeaderboardEntry {
  updatedAt?: string;
}