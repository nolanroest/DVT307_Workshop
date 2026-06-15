import React from 'react';
import { Heading, Text } from '../common';
import type { Difficulty } from '../../types';

interface EmptyGameStateProps {
  selectedDifficulty: Difficulty | 'all';
}

const EmptyGameState: React.FC<EmptyGameStateProps> = ({ selectedDifficulty }) => {
  const getEmptyStateMessage = () => {
    if (selectedDifficulty === 'all') {
      return {
        title: 'No games yet',
        description: 'You haven\'t played any games yet. Start your first Mastermind challenge!',
        emoji: '🎯'
      };
    } else {
      return {
        title: `No ${selectedDifficulty} games`,
        description: `You haven't played any ${selectedDifficulty} difficulty games yet. Try this difficulty level!`,
        emoji: '🎮'
      };
    }
  };

  const { title, description, emoji } = getEmptyStateMessage();

  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4" role="img" aria-label="Empty state illustration">
        {emoji}
      </div>
      <Heading level={3} className="mb-2 text-gray-600">
        {title}
      </Heading>
      <Text variant="body" color="secondary" className="mb-6 max-w-md mx-auto">
        {description}
      </Text>
    </div>
  );
};

export default EmptyGameState;