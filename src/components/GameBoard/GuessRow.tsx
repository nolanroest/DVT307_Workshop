import React from 'react';
import type { Guess } from '../../types';
import { Color, FeedbackDisplay } from '../common';

interface GuessRowProps {
  guess: Guess;
  slots: number;
  className?: string;
  attemptNumber?: number;
}

const GuessRow: React.FC<GuessRowProps> = ({
  guess,
  slots,
  className = '',
  attemptNumber = 1,
}) => {
  // Determine if this is a winning guess
  const isWinningGuess = guess.feedback.correctPosition === slots;
  
  return (
    <div 
      className={`rounded-lg border p-2 sm:p-3 shadow-sm transition-all duration-200 max-w-3xl mx-auto ${
        isWinningGuess 
          ? 'bg-green-50 border-green-200 ring-1 ring-green-300' 
          : 'bg-white border-gray-200 hover:border-gray-300'
      } ${className}`}
      role="region"
      aria-label={`Attempt ${attemptNumber} ${isWinningGuess ? '- Winning guess!' : ''}`}
    >
      {/* Responsive layout: stack on very small screens, horizontal on larger */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:flex-nowrap">
        {/* Guess colors with responsive layout */}
        <div 
          className="flex gap-1 sm:gap-2 justify-center"
          role="group"
          aria-label={`Attempt ${attemptNumber} colors`}
        >
        {guess.colors.map((color, index) => (
          <Color
            key={index}
            color={color}
            size="md"
            className={`transition-all duration-200 w-6 h-6 sm:w-8 sm:h-8 ${
              isWinningGuess 
                ? 'border-green-400 ring-1 ring-green-200' 
                : 'border-gray-300'
            }`}
            ariaLabel={`Position ${index + 1}: ${color.name}`}
            role="img"
          />
        ))}
      </div>
      
      {/* Feedback display with responsive layout */}
      <div className="flex justify-center">
        <FeedbackDisplay
          feedback={guess.feedback}
          maxSlots={slots}
          className={`rounded-md transition-all duration-200 ${
            isWinningGuess 
              ? 'bg-green-100 border border-green-200' 
              : 'bg-gray-50'
          }`}
          ariaLabel={`Attempt ${attemptNumber} feedback: ${guess.feedback.correctPosition} correct positions, ${guess.feedback.correctColor} correct colors in wrong positions`}
        />
      </div>
    </div>
  </div>
  );
};

export default GuessRow;