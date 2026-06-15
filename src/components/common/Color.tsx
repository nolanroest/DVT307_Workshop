import React from 'react';
import type { Color as ColorType } from '../../types';

interface ColorProps {
  color: ColorType | null;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  isSelected?: boolean;
  isClickable?: boolean;
  className?: string;
  ariaLabel?: string;
  role?: string;
}

const Color: React.FC<ColorProps> = ({
  color,
  size = 'md',
  onClick,
  isSelected = false,
  isClickable = false,
  className = '',
  ariaLabel,
  role,
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const baseClasses = `
    ${sizeClasses[size]}
    rounded-full
    border-2
    transition-all
    duration-200
    ${color ? 'shadow-sm' : 'bg-gray-200 border-gray-300'}
    ${isClickable ? 'cursor-pointer hover:scale-110 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2' : ''}
    ${isSelected ? 'ring-2 ring-gray-800 ring-offset-2' : 'border-gray-400'}
    ${className}
  `;

  const handleClick = () => {
    if (isClickable && onClick) {
      onClick();
    }
  };

  const getAriaLabel = () => {
    if (ariaLabel) return ariaLabel;
    if (color) return `${color.name} color`;
    return 'Empty slot';
  };

  const getRole = () => {
    if (role) return role;
    if (isClickable) return 'button';
    return 'img';
  };

  // Calculate contrast ratio for accessibility
  const getContrastColor = (hexColor: string) => {
    if (!hexColor) return '#000000';
    
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black or white based on luminance
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  return (
    <div
      className={baseClasses}
      style={{
        backgroundColor: color?.hex || 'transparent',
      }}
      onClick={handleClick}
      role={getRole()}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={getAriaLabel()}
      aria-describedby={color ? `color-${color.id}-desc` : undefined}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* High contrast indicator for accessibility */}
      {color && isSelected && (
        <div
          className="absolute inset-0 flex items-center justify-center rounded-full"
          style={{ color: getContrastColor(color.hex) }}
          aria-hidden="true"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
      
      {/* Hidden description for screen readers */}
      {color && (
        <span id={`color-${color.id}-desc`} className="sr-only">
          Color: {color.name}, Hex value: {color.hex}
        </span>
      )}
    </div>
  );
};

export default Color;