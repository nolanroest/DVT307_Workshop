import { useGameContext } from '../context/GameContext';

/**
 * Custom hook that provides read-only access to game state
 * This hook extracts commonly used state values for easy consumption by components
 */
export function useGame() {
  const { state } = useGameContext();
  
  return {
    // Game identification
    gameId: state.gameId,
    
    // Game configuration
    difficulty: state.config.difficulty,
    slots: state.config.slots,
    maxAttempts: state.config.maxAttempts,
    availableColors: state.config.colors,
    
    // Current game state
    secretCode: state.secretCode,
    currentGuess: state.currentGuess,
    guesses: state.guesses,
    gameStatus: state.gameStatus,
    attemptsRemaining: state.attemptsRemaining,
    currentSlotIndex: state.currentSlotIndex,
    canSubmit: state.canSubmit,
    
    // Computed values
    currentAttempt: state.guesses.length + 1,
    isGameActive: state.gameStatus === 'playing',
    isGameWon: state.gameStatus === 'won',
    isGameLost: state.gameStatus === 'lost',
    isGameComplete: state.gameStatus === 'won' || state.gameStatus === 'lost',
    
    // Current guess helpers
    isCurrentGuessComplete: !!state.gameId && state.currentGuess.length === state.config.slots && state.currentGuess.every(color => color !== null),
    currentGuessProgress: state.currentGuess.filter(color => color !== null).length,
    canBackspace: state.currentSlotIndex > 0,
    nextEmptySlotIndex: state.currentSlotIndex < state.config.slots ? state.currentSlotIndex : -1,
    
    // Game progress
    totalAttempts: state.config.maxAttempts,
    attemptsUsed: state.guesses.length,
    progressPercentage: (state.guesses.length / state.config.maxAttempts) * 100,
  };
}