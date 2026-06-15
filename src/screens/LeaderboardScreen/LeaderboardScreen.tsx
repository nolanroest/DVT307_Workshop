import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container } from '../../components/common';
import { Heading, Text } from '../../components/common';
import type { LeaderboardEntry, Difficulty } from '../../types';
import { ApiProvider } from '../../utils/api';

const LeaderboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [sortFilerData, setSortFilterData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch leaderboard data
  const fetchLeaderboard = async (difficulty?: Difficulty) => {
    try {
      setLoading(true);
      const data = await ApiProvider.getLeaderboard(difficulty);
      setLeaderboardData(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLeaderboardData([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    const difficulty = selectedDifficulty === 'all' ? undefined : selectedDifficulty;
    fetchLeaderboard(difficulty);
  }, [selectedDifficulty]);

  useEffect(() => {
    const filteredData = selectedDifficulty === 'all'
      ? leaderboardData
      : leaderboardData.filter(entry => entry.difficulty === selectedDifficulty);

    const sortedData = filteredData.sort((a, b) => {
      // Sort by best score ascending (lowest first), then by games won descending (highest first)
      if (a.bestScore !== b.bestScore) {
        return a.bestScore - b.bestScore;
      }
      return b.gamesWon - a.gamesWon;
    });

    setSortFilterData(sortedData);
  }, [leaderboardData]);

  const handleBackToMenu = () => {
    navigate('/');
  };

  const handleStartGame = () => {
    navigate('/');
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 pt-20">
      <Container size="full" padding="lg" className="bg-white rounded-xl shadow-lg max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Heading level={1} className="mb-4 text-blue-600">
            🏆 Leaderboard
          </Heading>
          <Text variant="body" color="secondary" className="max-w-md mx-auto">
            Top performers across all difficulty levels
          </Text>
        </div>

        {/* Difficulty Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <Button
            variant={selectedDifficulty === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedDifficulty('all')}
          >
            All Levels
          </Button>
          <Button
            variant={selectedDifficulty === 'easy' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedDifficulty('easy')}
          >
            Easy
          </Button>
          <Button
            variant={selectedDifficulty === 'medium' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedDifficulty('medium')}
          >
            Medium
          </Button>
          <Button
            variant={selectedDifficulty === 'hard' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedDifficulty('hard')}
          >
            Hard
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⏳</div>
            <Text variant="body" color="secondary">
              Loading leaderboard...
            </Text>
          </div>
        )}

        {/* Leaderboard Table */}
        {!loading && sortFilerData.length > 0 && (
          <div className="overflow-x-auto mb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Rank</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Player</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Difficulty</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Best Score</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Games Won</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Avg Score</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Won</th>
                </tr>
              </thead>
              <tbody>
                {sortFilerData.map((entry, index) => (
                  <tr 
                    key={`${entry.userId}-${entry.difficulty}`} 
                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                      index < 3 ? 'bg-gradient-to-r from-yellow-50 to-transparent' : ''
                    }`}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        {index === 0 && <span className="text-2xl mr-2">🥇</span>}
                        {index === 1 && <span className="text-2xl mr-2">🥈</span>}
                        {index === 2 && <span className="text-2xl mr-2">🥉</span>}
                        <span className="font-semibold text-gray-700">#{index + 1}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Text variant="body" className="font-medium">
                        {entry.username || `Player ${entry.userId.slice(-4)}`}
                      </Text>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getDifficultyColor(entry.difficulty)}`}>
                        {entry.difficulty}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <Text variant="body" className="font-medium">
                        {entry.bestScore}
                      </Text>
                    </td>
                    <td className="py-4 px-4">
                      <Text variant="body" className="font-medium">
                        {entry.gamesWon}
                      </Text>
                    </td>
                    <td className="py-4 px-4">
                      <Text variant="body" className="font-medium">
                        {entry.averageScore}
                      </Text>
                    </td>
                    <td className="py-4 px-4">
                      <Text variant="small" color="secondary">
                        {new Date(entry.lastWonAt).toLocaleDateString()}
                      </Text>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {!loading && sortFilerData.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <Heading level={3} className="mb-2 text-gray-600">
              No records found
            </Heading>
            <Text variant="body" color="secondary">
              No games completed for {selectedDifficulty === 'all' ? 'any' : selectedDifficulty} difficulty yet.
            </Text>
          </div>
        )}

        {/* Navigation Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6 border-t border-gray-200">
          <Button
            variant="primary"
            size="md"
            onClick={handleStartGame}
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

export default LeaderboardScreen;