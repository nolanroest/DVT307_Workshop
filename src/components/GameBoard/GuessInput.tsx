import React, { useRef } from 'react';
import type { Color as ColorType } from '../../types';
import { Color } from '../common';

interface GuessInputProps {
  currentGuess: (ColorType | null)[];
  slots: number;
  isActive?: boolean;
  className?: string;
  attemptNumber?: number;
}

const GuessInput: React.FC<GuessInputProps> = ({
  currentGuess,
  slots,
  isActive = true,
  className = '',
  attemptNumber = 1,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const filledSlots = currentGuess.filter(color => color !== null).length;
  const isComplete = filledSlots === slots;
  const nextEmptyIndex = currentGuess.findIndex(color => color === null);

  const getSlotAriaLabel = (index: number, color: ColorType | null) => {
    if (color) {
      return `Slot ${index + 1}: ${color.name} color`;
    }
    if (index === nextEmptyIndex) {
      return `Slot ${index + 1}: empty, next to fill`;
    }
    return `Slot ${index + 1}: empty`;
  };

  return (
    <div
      ref={containerRef}
      className={`bg-blue-50 rounded-lg border-2 border-blue-200 p-3 sm:p-4 shadow-sm transition-all duration-200 max-w-3xl mx-auto ${!isActive ? 'opacity-50' : ''
        } ${isComplete ? 'ring-2 ring-blue-400' : ''} ${className}`}
      tabIndex={isActive ? 0 : -1}
      role="region"
      aria-label={`Attempt ${attemptNumber} guess input`}
      aria-describedby={`guess-status-${attemptNumber}`}
    >
      {/* Responsive layout: stack on very small screens, horizontal on larger */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:flex-nowrap">
        {/* Current guess slots with responsive layout */}
        <div className="flex gap-1 sm:gap-2 justify-center">
          {Array.from({ length: slots }, (_, index) => {
            const color = currentGuess[index];
            const isEmpty = color === null;
            const isNextEmpty = index === nextEmptyIndex;

          return (
            <div
              key={index}
              role="img"
              aria-label={getSlotAriaLabel(index, color)}
              className="relative"
            >
              <Color
                color={color}
                size="md"
                className={`
                  transition-all duration-200 w-6 h-6 sm:w-8 sm:h-8
                  ${isEmpty ? 'border-dashed border-blue-300 bg-blue-100' : 'border-blue-400'}
                  ${isNextEmpty ? 'ring-2 ring-blue-300 animate-pulse' : ''}
                `}
              />
              {/* Position indicator for screen readers */}
              {isNextEmpty && (
                <span className="sr-only">Next slot to fill</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center">
        <div
          className="text-xs sm:text-sm text-blue-600 font-medium"
          aria-label={`${filledSlots} of ${slots} slots filled`}
        >
          {filledSlots}/{slots}
        </div>
      </div>
    </div>

      {/* Status for screen readers */}
      <div
        id={`guess-status-${attemptNumber}`}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {isComplete
          ? `Guess complete with ${filledSlots} colors.`
          : `Guess in progress: ${filledSlots} of ${slots} colors selected. ${nextEmptyIndex !== -1 ? `Next slot to fill: position ${nextEmptyIndex + 1}.` : ''
          }`
        }
      </div>
    </div>
  );
};

export default GuessInput;