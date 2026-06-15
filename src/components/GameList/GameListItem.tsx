import React from 'react';
import { Text } from '../common';
import type { GameListItem as GameListItemType, GameStatus, Difficulty } from '../../types';

interface GameListItemProps {
  game: GameListItemType;
  onClick: (gameId: string) => void;
}

const GameListItem: React.FC<GameListItemProps> = ({ game, onClick }) => {
  const handleClick = () => {
    onClick(game.gameId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(game.gameId);
    }
  };

  const getDifficultyColor = (difficulty: Difficulty): string => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'hard':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: GameStatus): string => {
    switch (status) {
      case 'won':
        return 'text-green-600 bg-green-100';
      case 'lost':
        return 'text-red-600 bg-red-100';
      case 'playing':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: GameStatus): string => {
    switch (status) {
      case 'won':
        return '🏆';
      case 'lost':
        return '💔';
      case 'playing':
        return '🎮';
      default:
        return '❓';
    }
  };

  const getStatusText = (status: GameStatus): string => {
    switch (status) {
      case 'won':
        return 'Won';
      case 'lost':
        return 'Lost';
      case 'playing':
        return 'In Progress';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Game ${game.gameId.slice(-8)} - ${game.difficulty} difficulty - ${getStatusText(game.status)}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left side - Game info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-2xl" role="img" aria-label={`${getStatusText(game.status)} status`}>
              {getStatusIcon(game.status)}
            </div>
            <div>
              <Text variant="body" className="font-semibold text-gray-900">
                Game #{game.gameId.slice(-8)}
              </Text>
              <Text variant="small" color="secondary">
                Created {formatDate(game.createdAt)}
              </Text>
            </div>
          </div>

          {/* Game metadata */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getDifficultyColor(game.difficulty)}`}>
              {game.difficulty}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(game.status)}`}>
              {getStatusText(game.status)}
            </span>
            {game.totalGuesses !== undefined && (
              <span className="px-2 py-1 rounded-full text-xs font-medium text-gray-600 bg-gray-100">
                {game.totalGuesses} guess{game.totalGuesses !== 1 ? 'es' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Right side - Action indicator */}
        <div className="flex items-center text-gray-400">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default GameListItem;