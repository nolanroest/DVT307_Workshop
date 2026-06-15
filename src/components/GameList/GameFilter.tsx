import React from 'react';
import { Button } from '../common';
import type { Difficulty } from '../../types';

interface GameFilterProps {
  selectedDifficulty: Difficulty | 'all';
  onFilterChange: (difficulty: Difficulty | 'all') => void;
}

const GameFilter: React.FC<GameFilterProps> = ({ selectedDifficulty, onFilterChange }) => {
  const filterOptions: Array<{ value: Difficulty | 'all'; label: string }> = [
    { value: 'all', label: 'All Games' },
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8" role="group" aria-label="Filter games by difficulty">
      {filterOptions.map((option) => (
        <Button
          key={option.value}
          variant={selectedDifficulty === option.value ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onFilterChange(option.value)}
          aria-pressed={selectedDifficulty === option.value}
          className="transition-all duration-200"
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
};

export default GameFilter;