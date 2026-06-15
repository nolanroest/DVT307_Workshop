import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Heading, Text } from '../../components/common';
import type { GameListItem as GameListItemType, Difficulty } from '../../types';
import { GameListItem, GameFilter, EmptyGameState } from '../../components/GameList';

const GameListScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [games, setGames] = useState<GameListItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch games data
  const fetchGames = async (difficulty?: Difficulty) => {
    try {
      setLoading(true);
      setError(null);
      setGames([]);
    } catch (error) {
      console.error('Error fetching games:', error);
      setError('Failed to load games. Please try again.');
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    const difficulty = selectedDifficulty === 'all' ? undefined : selectedDifficulty;
    fetchGames(difficulty);
  }, [selectedDifficulty]);

  const handleGameClick = (gameId: string) => {
    navigate(`/game/${gameId}`);
  };

  const handleBackToMenu = () => {
    navigate('/');
  };

  const handleStartNewGame = () => {
    navigate('/');
  };

  const handleFilterChange = (difficulty: Difficulty | 'all') => {
    setSelectedDifficulty(difficulty);
  };

  const handleRetry = () => {
    const difficulty = selectedDifficulty === 'all' ? undefined : selectedDifficulty;
    fetchGames(difficulty);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 pt-20">
      <Container size="full" padding="lg" className="bg-white rounded-xl shadow-lg max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Heading level={1} className="mb-4 text-blue-600">
            🎮 My Games
          </Heading>
          <Text variant="body" color="secondary" className="max-w-md mx-auto">
            View and manage your Mastermind game history
          </Text>
        </div>

        {/* Difficulty Filter */}
        <GameFilter
          selectedDifficulty={selectedDifficulty}
          onFilterChange={handleFilterChange}
        />

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⏳</div>
            <Text variant="body" color="secondary">
              Loading games...
            </Text>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⚠️</div>
            <Heading level={3} className="mb-2 text-red-600">
              Error Loading Games
            </Heading>
            <Text variant="body" color="secondary" className="mb-6">
              {error}
            </Text>
            <Button variant="primary" onClick={handleRetry}>
              Try Again
            </Button>
          </div>
        )}

        {/* Games List */}
        {!loading && !error && games.length > 0 && (
          <div className="mb-8">
            <div className="grid gap-4 md:gap-6">
              {games.map((game) => (
                <GameListItem
                  key={game.gameId}
                  game={game}
                  onClick={handleGameClick}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && games.length === 0 && (
          <EmptyGameState
            selectedDifficulty={selectedDifficulty}
          />
        )}

        {/* Navigation Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6 border-t border-gray-200">
          <Button
            variant="primary"
            size="md"
            onClick={handleStartNewGame}
            className="sm:w-auto"
          >
            Start New Game
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={handleBackToMenu}
            className="sm:w-auto"
          >
            Back to Menu
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default GameListScreen;