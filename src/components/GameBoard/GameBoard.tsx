import React from 'react';
import { useGame } from '../../hooks/useGame';
import GuessRow from './GuessRow';
import GuessInput from './GuessInput';
import { Container } from '../common';

interface GameBoardProps {
  className?: string;
}

const GameBoard: React.FC<GameBoardProps> = ({
  className = 'game-board',
}) => {
  const {
    guesses,
    currentGuess,
    slots,
    maxAttempts,
    currentAttempt,
    isGameActive,
    isGameComplete,
    progressPercentage,
  } = useGame();

  const isGameWon = isGameComplete && guesses[guesses.length - 1]?.feedback.correctPosition === slots;

  return (
    <Container size="full" padding="md" className={`${className} max-w-3xl min-w-96 mx-auto`}>
      <div className="space-y-3 sm:space-y-4">
        {/* Game progress header with improved accessibility */}
        <div 
          className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200"
          role="region"
          aria-label="Game progress"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-2">
            <h2 
              className="text-base sm:text-lg font-semibold text-gray-800"
              id="game-progress-heading"
            >
              Attempt {currentAttempt} of {maxAttempts}
            </h2>
          </div>
          
          {/* Progress bar with accessibility */}
          <div 
            className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={currentAttempt}
            aria-valuemin={1}
            aria-valuemax={maxAttempts}
            aria-label={`Game progress: attempt ${currentAttempt} of ${maxAttempts}`}
          >
            <div 
              className={`h-full transition-all duration-500 ${
                progressPercentage > 75 ? 'bg-red-400' : 
                progressPercentage > 50 ? 'bg-yellow-400' : 
                'bg-green-400'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Game board with improved accessibility and scroll capability */}
        <div 
          className="space-y-2 sm:space-y-3"
          role="region"
          aria-label="Game board with guesses"
          aria-describedby="game-board-description"
        >
          {/* Hidden description for screen readers */}
          <div id="game-board-description" className="sr-only">
            Game board showing {guesses.length} completed guesses out of {maxAttempts} maximum attempts.
            {isGameActive && " Current guess in progress."}
          </div>

          {/* Completed guesses */}
          {guesses.map((guess, index) => (
            <GuessRow
              key={index}
              guess={guess}
              slots={slots}
              attemptNumber={index + 1}
              className="animate-in slide-in-from-top-2 duration-300"
            />
          ))}

          {/* Current guess input (only show if game is active) */}
          {isGameActive && (
            <GuessInput
              currentGuess={currentGuess}
              slots={slots}
              isActive={isGameActive}
              attemptNumber={currentAttempt}
              className="animate-in slide-in-from-top-2 duration-300"
            />
          )}

          {/* Empty state when no guesses yet */}
          {guesses.length === 0 && !isGameActive && (
            <div 
              className="text-center py-6 sm:py-8 text-gray-500"
              role="status"
              aria-live="polite"
            >
              <div className="text-base sm:text-lg font-medium mb-2">Ready to start?</div>
              <div className="text-sm">Make your first guess to begin!</div>
            </div>
          )}
        </div>

        {/* Game status indicator with improved accessibility */}
        {isGameComplete && (
          <div 
            className={`text-center p-3 sm:p-4 rounded-lg border-2 animate-in slide-in-from-bottom-2 duration-500 ${
              isGameWon
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
            role="alert"
            aria-live="assertive"
          >
            <div className="font-semibold text-base sm:text-lg">
              {isGameWon
                ? '🎉 Congratulations! You cracked the code!' 
                : '💔 Game Over! Better luck next time!'
              }
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default GameBoard;