import React from 'react';
import type { Feedback } from '../../types';

interface FeedbackDisplayProps {
  feedback: Feedback;
  maxSlots: number;
  className?: string;
  ariaLabel?: string;
}

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({
  feedback,
  maxSlots,
  className = '',
  ariaLabel,
}) => {
  // Create array of feedback pegs
  const feedbackPegs = [];
  
  // Add black pegs (correct position)
  for (let i = 0; i < feedback.correctPosition; i++) {
    feedbackPegs.push('black');
  }
  
  // Add white pegs (correct color, wrong position)
  for (let i = 0; i < feedback.correctColor; i++) {
    feedbackPegs.push('white');
  }
  
  // Fill remaining slots with empty pegs
  while (feedbackPegs.length < maxSlots) {
    feedbackPegs.push('empty');
  }

  const getPegClasses = (pegType: string) => {
    const baseClasses = 'w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border';
    
    switch (pegType) {
      case 'black':
        return `${baseClasses} bg-gray-800 border-gray-900`;
      case 'white':
        return `${baseClasses} bg-white border-gray-400`;
      case 'empty':
      default:
        return `${baseClasses} bg-gray-100 border-gray-300`;
    }
  };

  const getPegAriaLabel = (pegType: string, index: number) => {
    switch (pegType) {
      case 'black':
        return `Feedback peg ${index + 1}: Correct color and position`;
      case 'white':
        return `Feedback peg ${index + 1}: Correct color, wrong position`;
      case 'empty':
      default:
        return `Feedback peg ${index + 1}: No match`;
    }
  };

  const getOverallAriaLabel = () => {
    if (ariaLabel) return ariaLabel;
    
    const parts = [];
    if (feedback.correctPosition > 0) {
      parts.push(`${feedback.correctPosition} correct position${feedback.correctPosition !== 1 ? 's' : ''}`);
    }
    if (feedback.correctColor > 0) {
      parts.push(`${feedback.correctColor} correct color${feedback.correctColor !== 1 ? 's' : ''} in wrong position${feedback.correctColor !== 1 ? 's' : ''}`);
    }
    if (parts.length === 0) {
      return 'No correct colors or positions';
    }
    return `Feedback: ${parts.join(', ')}`;
  };

  return (
    <div 
      className={`flex flex-wrap gap-1 justify-center items-center p-1.5 sm:p-2 ${className}`}
      role="group"
      aria-label={getOverallAriaLabel()}
    >
      {feedbackPegs.map((pegType, index) => (
        <div
          key={index}
          className={getPegClasses(pegType)}
          role="img"
          aria-label={getPegAriaLabel(pegType, index)}
        />
      ))}
      
      {/* Hidden summary for screen readers */}
      <span className="sr-only">
        Feedback summary: {feedback.correctPosition} black pegs for correct positions, 
        {feedback.correctColor} white pegs for correct colors in wrong positions
      </span>
    </div>
  );
};

export default FeedbackDisplay;