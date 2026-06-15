import React, { useRef, useEffect } from 'react';
import type { Color as ColorType } from '../../types';
import { GAME_COLORS } from '../../constants';
import Color from '../common/Color';
import Button from '../common/Button';

interface ColorPickerProps {
  onColorSelect: (color: ColorType) => void;
  onBackspace?: () => void;
  canBackspace?: boolean;
  onSubmit?: () => void;
  canSubmit?: boolean;
  className?: string;
  autoFocus?: boolean;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  onColorSelect,
  onBackspace,
  canBackspace = false,
  onSubmit,
  canSubmit = false,
  className = 'color-picker',
  autoFocus = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const firstColorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus && firstColorRef.current) {
      firstColorRef.current.focus();
    }
  }, [autoFocus]);

  const handleBackspace = () => {
    if (canBackspace && onBackspace) {
      onBackspace();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const focusableElements = containerRef.current?.querySelectorAll(
      '[tabindex="0"]:not([disabled])'
    ) as NodeListOf<HTMLElement>;
    
    if (!focusableElements || focusableElements.length === 0) return;

    const currentIndex = Array.from(focusableElements).indexOf(
      document.activeElement as HTMLElement
    );

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
        focusableElements[prevIndex]?.focus();
        break;
      case 'ArrowRight':
        event.preventDefault();
        const nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
        focusableElements[nextIndex]?.focus();
        break;
      case 'Home':
        event.preventDefault();
        focusableElements[0]?.focus();
        break;
      case 'End':
        event.preventDefault();
        focusableElements[focusableElements.length - 1]?.focus();
        break;
      case 'Backspace':
        if (canBackspace) {
          event.preventDefault();
          handleBackspace();
        }
        break;
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`bg-white rounded-lg shadow-md border border-gray-200 p-2 sm:p-4 ${className}`}
      onKeyDown={handleKeyDown}
      role="toolbar"
      aria-label="Color selection toolbar"
      aria-describedby="color-picker-instructions"
    >
      {/* Screen reader instructions */}
      <div 
        id="color-picker-instructions" 
        className="sr-only"
        aria-live="polite"
      >
        Use arrow keys to navigate colors, Enter or Space to select, Backspace to remove last color
      </div>

      {/* Responsive layout: stack on very small screens, horizontal on larger */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:flex-nowrap">
        {/* Color options with responsive sizing */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:flex-nowrap">
          {GAME_COLORS.map((color, index) => (
            <div
              key={color.id}
              ref={index === 0 ? firstColorRef : undefined}
              tabIndex={0}
              role="button"
              aria-label={`Select ${color.name} color`}
              className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
              onClick={() => onColorSelect(color)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onColorSelect(color);
                }
              }}
            >
              <Color
                color={color}
                size="lg"
                isClickable={false} // Handle clicks at parent level for better accessibility
                className="hover:ring-2 hover:ring-blue-300 hover:ring-offset-1 hover:scale-105 transition-all duration-200 w-10 h-10 sm:w-12 sm:h-12"
              />
            </div>
          ))}
        </div>
        
        {/* Action buttons with responsive sizing */}
        <div className="flex gap-2">
          {/* Backspace button */}
          <Button
            variant="outline"
            size="md"
            onClick={handleBackspace}
            disabled={!canBackspace}
            className={`px-2 py-2 sm:px-3 sm:py-2 min-w-[80px] sm:min-w-[100px] text-xs sm:text-sm transition-all duration-200 ${
              canBackspace 
                ? 'hover:bg-red-50 hover:border-red-300 hover:text-red-600' 
                : 'opacity-50 cursor-not-allowed'
            }`}
            aria-label={canBackspace ? 'Remove last color from guess' : 'No colors to remove'}
          >
            <span className="flex items-center gap-1 sm:gap-2">
              <svg 
                className="w-3 h-3 sm:w-4 sm:h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" 
                />
              </svg>
              <span className="hidden sm:inline">Backspace</span>
              <span className="sm:hidden">Back</span>
            </span>
          </Button>

          {/* Submit button */}
          <Button
            variant={canSubmit ? 'primary' : 'outline'}
            size="md"
            onClick={onSubmit}
            disabled={!canSubmit}
            className={`px-2 py-2 sm:px-3 sm:py-2 min-w-[80px] sm:min-w-[100px] text-xs sm:text-sm transition-all duration-200 ${
              canSubmit ? 'animate-pulse' : 'opacity-50 cursor-not-allowed'
            }`}
            aria-label={canSubmit ? 'Submit your guess' : 'Complete your guess to submit'}
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;