import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameContext } from '../../context/GameContext';
import { Button } from '../../components/common';
import { Container } from '../../components/common';
import { Heading, Text } from '../../components/common';
import type { Difficulty } from '../../types';

// Inline constants to avoid circular dependency
const DIFFICULTY_SLOTS = {
  easy: 4,
  medium: 6,
  hard: 8,
} as const;

const EntryScreen: React.FC = () => {
  const navigate = useNavigate();
  const { startGame } = useGameContext();

  const handleStartGame = async (difficulty: Difficulty) => {
    try {
      const response = await startGame(difficulty);
      navigate(`/game/${response.gameId}`);
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  };

  const handleNavigateToLeaderboard = () => {
    navigate('/leaderboard');
  };

  const difficultyOptions = [
    {
      difficulty: 'easy' as const,
      label: 'Easy',
      slots: DIFFICULTY_SLOTS.easy,
      description: 'Perfect for beginners',
    },
    {
      difficulty: 'medium' as const,
      label: 'Medium',
      slots: DIFFICULTY_SLOTS.medium,
      description: 'A balanced challenge',
    },
    {
      difficulty: 'hard' as const,
      label: 'Hard',
      slots: DIFFICULTY_SLOTS.hard,
      description: 'For experienced players',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pt-20">
      <Container size="md" padding="lg" className="bg-white rounded-xl shadow-lg">
        <div className="text-center">
          {/* Game Title */}
          <Heading level={1} className="mb-4 text-blue-600">
            Mastermind
          </Heading>
          
          {/* Game Description */}
          <Text variant="body" color="secondary" className="mb-8 max-w-md mx-auto">
            Break the secret code! Choose colors to fill the slots and use the feedback 
            to crack the code within 10 attempts. Black pegs mean correct color and position, 
            white pegs mean correct color but wrong position.
          </Text>

          {/* Difficulty Selection */}
          <div className="mb-8">
            <Heading level={3} className="mb-6 text-gray-800">
              Choose Your Challenge
            </Heading>
            
            <div className="space-y-4">
              {difficultyOptions.map(({ difficulty, label, slots, description }) => (
                <div
                  key={difficulty}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-left">
                      <Text variant="body" weight="semibold" className="text-gray-900">
                        {label}
                      </Text>
                      <Text variant="small" color="muted">
                        {description}
                      </Text>
                    </div>
                    <div className="text-right">
                      <Text variant="small" color="secondary" className="mb-1">
                        {slots} slots
                      </Text>
                      <div className="flex space-x-1">
                        {Array.from({ length: slots }, (_, index) => (
                          <div
                            key={index}
                            className="w-4 h-4 rounded-full border-2 border-gray-300 bg-gray-100"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    onClick={() => handleStartGame(difficulty)}
                    className="mt-3"
                  >
                    Start {label} Game
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="border-t border-gray-200 pt-6">
            <Button
              variant="outline"
              size="md"
              onClick={handleNavigateToLeaderboard}
              className="w-full sm:w-auto"
            >
              View Leaderboard
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default EntryScreen;