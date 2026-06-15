import { useCallback } from 'react';
import { useGameContext } from '../context/GameContext';
import type { Color, Difficulty } from '../types';

/**
 * Custom hook that provides game action functions
 * This hook encapsulates all game state mutations and provides a clean API for components
 */
export function useGameActions() {
  const { state, dispatch } = useGameContext(); 
  /**
   * Updates a specific position in the current guess
   * @param index - The position index to update (0-based)
   * @param color - The color to place at the position, or null to clear
   */
  const updateCurrentGuess = useCallback((index: number, color: Color | null) => {
    dispatch({ type: 'UPDATE_CURRENT_GUESS', payload: { index, color } });
  }, [dispatch]);
  
  /**
   * Sets a color at the next available position in the current guess
   * @param color - The color to add to the guess
   * @returns boolean indicating if the color was successfully added
   */
  const addColorToGuess = useCallback((color: Color) => {
    dispatch({ type: 'ADD_COLOR_TO_SLOT', payload: { color } });
    return true;
  }, [dispatch]);
  
  /**
   * Clears a specific position in the current guess
   * @param index - The position index to clear
   */
  const clearGuessPosition = useCallback((index: number) => {
    dispatch({ type: 'UPDATE_CURRENT_GUESS', payload: { index, color: null } });
  }, [dispatch]);
  
  /**
   * Removes the last added color from the current guess (backspace functionality)
   * @returns boolean indicating if a color was successfully removed
   */
  const removeLastColor = useCallback(() => {
    dispatch({ type: 'BACKSPACE_COLOR' });
    return true;
  }, [dispatch]);

  /**
   * Clears the entire current guess
   */
  const clearCurrentGuess = useCallback(() => {
    for (let i = 0; i < state.config.slots; i++) {
      dispatch({ type: 'UPDATE_CURRENT_GUESS', payload: { index: i, color: null } });
    }
  }, [state.config.slots, dispatch]);
  
  /**
   * Submits the current guess for evaluation
   * Uses AppSync Events if API is enabled, otherwise local evaluation
   */
  const submitGuess = useCallback(async () => {
    dispatch({ type: 'SUBMIT_GUESS' });
  }, [dispatch, state.gameId, state.currentGuess]);

  /**
   * Adds a color to the current slot and automatically submits if the guess is complete
   * @param color - The color to add to the guess
   */
  const addColorAndAutoSubmit = useCallback(async (color: Color) => {
    dispatch({ type: 'ADD_COLOR_TO_SLOT', payload: { color } });
    
    // Check if this addition completes the guess
    const newSlotIndex = state.currentSlotIndex + 1;
    if (newSlotIndex === state.config.slots) {
      // Automatically submit the guess after a brief delay to allow UI to update
      setTimeout(async () => {
        await submitGuess();
      }, 100);
    }
  }, [state.currentSlotIndex, state.config.slots, dispatch, submitGuess]);
  
  /**
   * Resets the game to initial state
   */
  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, [dispatch]);
  
  /**
   * Restarts the game with the same difficulty
   * This is a convenience method that combines reset and start
   */
  const restartGame = useCallback((difficulty: Difficulty) => {
    dispatch({ type: 'RESET_GAME', payload: { difficulty} });
  }, [dispatch]);
  
  return {
    // Core game actions
    resetGame,
    restartGame,
    
    // Guess management
    updateCurrentGuess,
    addColorToGuess,
    addColorAndAutoSubmit,
    clearGuessPosition,
    removeLastColor,
    clearCurrentGuess,
    submitGuess,
  };
}