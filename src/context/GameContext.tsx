import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import { GAME_COLORS } from '../constants'
import type { GameState, GameConfig, Color, Guess, Difficulty, GameStatus } from '../types';
import { generateLocalGameId, generateSecretCode } from '../utils/gameUtils';

const DIFFICULTY_CONFIG: Record<Difficulty, { slots: number; maxAttempts: number; colors: Color[] }> = {
  easy: { slots: 4, maxAttempts: 10, colors: GAME_COLORS },
  medium: { slots: 6, maxAttempts: 10, colors: GAME_COLORS },
  hard: { slots: 8, maxAttempts: 10, colors: GAME_COLORS },
};

// Action types for game state management
export type GameAction =
  | { type: 'START_GAME'; payload: { gameId: string; difficulty: Difficulty; secretCode?: Color[] } }
  | { type: 'UPDATE_CURRENT_GUESS'; payload: { index: number; color: Color | null } }
  | { type: 'ADD_COLOR_TO_SLOT'; payload: { color: Color } }
  | { type: 'BACKSPACE_COLOR' }
  | { type: 'SUBMIT_GUESS' }
  | { type: 'RESET_GAME'; payload?: { difficulty: Difficulty} }
  | { type: 'SET_GAME_STATE'; payload: GameState };

// Extended game state that includes configuration
export interface GameContextState extends GameState {
  config: GameConfig;
  gameId?: string;
  loading: boolean;
  error?: string;
}

// Context value interface
export interface GameContextValue {
  state: GameContextState;
  dispatch: React.Dispatch<GameAction>;
  startGame: (difficulty: Difficulty) => Promise<string>;
}

// Initial state
const createInitialState = (): GameContextState => ({
  secretCode: [],
  currentGuess: [],
  guesses: [],
  gameStatus: 'playing',
  attemptsRemaining: 10,
  currentSlotIndex: 0,
  canSubmit: false,
  loading: false,
  config: {
    difficulty: 'easy',
    slots: 4,
    maxAttempts: 10,
    colors: DIFFICULTY_CONFIG.easy.colors,
  },
});

// Game state reducer
function gameReducer(state: GameContextState, action: GameAction): GameContextState {
  switch (action.type) {
    case 'START_GAME': {
      const { gameId, secretCode } = action.payload;
      return {
        ...state,
        loading: false,
        gameId,
        secretCode: secretCode || [], // Use local secret code if provided, empty array for API mode
      };
    }

    case 'UPDATE_CURRENT_GUESS': {
      const { index, color } = action.payload;

      // Don't allow updates if no game has been started
      if (!state.gameId) {
        return state;
      }

      // Validate index bounds
      if (index < 0 || index >= state.config.slots) {
        return state;
      }

      // Don't allow updates if game is not in playing state
      if (state.gameStatus !== 'playing') {
        return state;
      }

      const newCurrentGuess = [...state.currentGuess];
      newCurrentGuess[index] = color;

      // Update currentSlotIndex and canSubmit based on the new guess state
      const filledSlots = newCurrentGuess.filter(slot => slot !== null).length;
      const newCurrentSlotIndex = Math.min(filledSlots, state.config.slots - 1);
      const newCanSubmit = filledSlots === state.config.slots;

      return {
        ...state,
        currentGuess: newCurrentGuess,
        currentSlotIndex: newCurrentSlotIndex,
        canSubmit: newCanSubmit,
      };
    }

    case 'ADD_COLOR_TO_SLOT': {
      const { color } = action.payload;

      // Don't allow updates if no game has been started
      if (!state.gameId) {
        return state;
      }

      // Don't allow updates if game is not in playing state
      if (state.gameStatus !== 'playing') {
        return state;
      }

      // Don't allow adding if current guess is already full
      if (state.currentSlotIndex >= state.config.slots) {
        return state;
      }

      const newCurrentGuess = [...state.currentGuess];
      newCurrentGuess[state.currentSlotIndex] = color;

      const newCurrentSlotIndex = state.currentSlotIndex + 1;
      const newCanSubmit = newCurrentSlotIndex === state.config.slots;

      return {
        ...state,
        currentGuess: newCurrentGuess,
        currentSlotIndex: newCurrentSlotIndex,
        canSubmit: newCanSubmit,
      };
    }

    case 'BACKSPACE_COLOR': {
      // Don't allow backspace if no game has been started
      if (!state.gameId) {
        return state;
      }

      // Don't allow backspace if game is not in playing state
      if (state.gameStatus !== 'playing') {
        return state;
      }

      // Don't allow backspace if current guess is empty
      if (state.currentSlotIndex === 0) {
        return state;
      }

      const newCurrentGuess = [...state.currentGuess];
      const indexToRemove = state.currentSlotIndex - 1;
      newCurrentGuess[indexToRemove] = null;

      const newCurrentSlotIndex = indexToRemove;
      const newCanSubmit = false; // Can't submit after removing a color

      return {
        ...state,
        currentGuess: newCurrentGuess,
        currentSlotIndex: newCurrentSlotIndex,
        canSubmit: newCanSubmit,
      };
    }

    case 'SUBMIT_GUESS': {
      // Don't allow submission if no game has been started
      if (!state.gameId) {
        return state;
      }

      // Don't allow submission if game is not in playing state
      if (state.gameStatus !== 'playing') {
        return state;
      }

      // Don't allow submission if no attempts remaining
      if (state.attemptsRemaining <= 0) {
        return state;
      }

      // Simple validation - check if guess is complete
      const hasNullValues = state.currentGuess.some(color => color === null);
      if (hasNullValues) {
        console.warn('Guess is not complete');
        return state;
      }

      const completeGuess = state.currentGuess as Color[];

      // Simple feedback calculation
      let correctPosition = 0;
      let correctColor = 0;

      // Count exact matches
      for (let i = 0; i < completeGuess.length; i++) {
        if (completeGuess[i].id === state.secretCode[i].id) {
          correctPosition++;
        }
      }

      // Count color matches (simplified)
      const secretIds = state.secretCode.map(c => c.id);
      const guessIds = completeGuess.map(c => c.id);

      for (const guessId of guessIds) {
        const secretIndex = secretIds.indexOf(guessId);
        if (secretIndex !== -1) {
          correctColor++;
          secretIds[secretIndex] = ''; // Mark as used
        }
      }

      correctColor -= correctPosition; // Remove exact matches from color count

      const feedback = { correctPosition, correctColor };

      // Create new guess object
      const newGuess: Guess = {
        colors: completeGuess,
        feedback,
      };

      // Update attempts remaining
      const newAttemptsRemaining = state.attemptsRemaining - 1;

      // Determine new game status
      let newGameStatus: GameStatus = 'playing';
      if (correctPosition === state.config.slots) {
        newGameStatus = 'won';
      } else if (newAttemptsRemaining <= 0) {
        newGameStatus = 'lost';
      }

      // Reset current guess for next attempt
      const newCurrentGuess = new Array(state.config.slots).fill(null);

      return {
        ...state,
        currentGuess: newCurrentGuess,
        guesses: [...state.guesses, newGuess],
        gameStatus: newGameStatus,
        attemptsRemaining: newAttemptsRemaining,
        currentSlotIndex: 0,
        canSubmit: false,
      };
    }

    case 'RESET_GAME': {
      return createInitialState();
    }

    case 'SET_GAME_STATE': {
      return {
        ...action.payload,
        config: state.config, // Preserve config
        gameId: state.gameId, // Preserve gameId
        loading: state.loading, // Preserve loading
        error: state.error, // Preserve error
      };
    }

    default:
      return state;
  }
}

// Create context
const GameContext = createContext<GameContextValue | undefined>(undefined);

// Context provider component
export interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);

  const startGame = async (difficulty: Difficulty): Promise<string> => {
    const gameId = generateLocalGameId()
    dispatch({ 
      type: 'START_GAME', 
      payload: { 
        gameId: gameId, 
        difficulty: difficulty,
        secretCode: generateSecretCode(difficulty)
      } 
    });
    return gameId;
  };

  const value: GameContextValue = {
    state,
    dispatch,
    startGame,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

// Hook to use game context
export function useGameContext(): GameContextValue {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}