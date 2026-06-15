import React from 'react';
import type { Color as ColorType } from '../../types';
import { Color } from '../common';

interface CurrentGuessProps {
  currentGuess: (ColorType | null)[];
  slots: number;
  onColorClick?: (index: number) => void;
  isActive?: boolean;
  className?: string;
  attemptNumber?: number;
}

const CurrentGuess: React.FC<CurrentGuessProps> = ({
  currentGuess,
  slots,
  onColorClick,
  isActive = true,
  className = '',
  attemptNumber = 1,
}) => {
  const filledSlots = currentGuess.filter(color => color !== null).length;
  const nextEmptyIndex = currentGuess.findIndex(color => color === null);

  const handleSlotClick = (index: number) => {
    if (isActive && onColorClick) {
      onColorClick(index);
    }
  };

  return (
    <div 
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between bg-blue-50 rounded-lg border-2 border-blue-200 p-2 sm:p-3 shadow-sm ${!isActive ? 'opacity-50' : ''} ${className}`}
      role="region"
      aria-label={`Current attempt ${attemptNumber} in progress`}
      aria-describedby={`current-guess-status-${attemptNumber}`}
    >
      {/* Current guess colors with responsive layout */}
      <div 
        className="flex gap-1 sm:gap-2 justify-center sm:justify-start mb-2 sm:mb-0"
        role="group"
        aria-label={`Current attempt ${attemptNumber} color slots`}
      >
        {Array.from({ length: slots }, (_, index) => {
          const color = currentGuess[index];
          const isNextEmpty = index === nextEmptyIndex;
          
          return (
            <div
              key={index}
              className="relative"
            >
              <Color
                color={color}
                size="md"
                isClickable={isActive}
                onClick={() => handleSlotClick(index)}
                className={`
                  w-6 h-6 sm:w-8 sm:h-8 transition-all duration-200
                  ${isActive ? 'hover:ring-2 hover:ring-blue-300 focus:ring-2 focus:ring-blue-500' : ''}
                  ${color ? 'border-blue-400' : 'border-dashed border-blue-300 bg-blue-100'}
                  ${isNextEmpty ? 'ring-2 ring-blue-300 animate-pulse' : ''}
                `}
                ariaLabel={
                  color 
                    ? `Position ${index + 1}: ${color.name} color` 
                    : isNextEmpty 
                      ? `Position ${index + 1}: empty, next to fill`
                      : `Position ${index + 1}: empty`
                }
                role={isActive ? "button" : "img"}
              />
              {/* Visual indicator for next empty slot */}
              {isNextEmpty && (
                <span className="sr-only">Next slot to fill</span>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Progress indicator with responsive layout */}
      <div className="flex items-center justify-center sm:justify-end gap-2 sm:ml-4">
        <div 
          className="text-xs sm:text-sm text-blue-600 font-medium"
          aria-label={`${filledSlots} of ${slots} slots filled`}
        >
          {filledSlots}/{slots}
        </div>
        <div 
          className="w-12 sm:w-16 h-2 bg-blue-100 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={filledSlots}
          aria-valuemin={0}
          aria-valuemax={slots}
          aria-label={`Current guess progress: ${filledSlots} of ${slots} colors selected`}
        >
          <div 
            className="h-full bg-blue-400 transition-all duration-300"
            style={{ 
              width: `${(filledSlots / slots) * 100}%` 
            }}
          />
        </div>
      </div>

      {/* Status for screen readers */}
      <div 
        id={`current-guess-status-${attemptNumber}`}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        Current attempt {attemptNumber}: {filledSlots} of {slots} colors selected.
        {nextEmptyIndex !== -1 && ` Next slot to fill: position ${nextEmptyIndex + 1}.`}
      </div>
    </div>
  );
};

export default CurrentGuess;