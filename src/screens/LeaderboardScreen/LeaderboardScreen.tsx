import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container } from '../../components/common';
import { Heading, Text } from '../../components/common';
import type { LeaderboardEntry, Difficulty } from '../../types';

// Dummy leaderboard data
const dummyLeaderboardData: LeaderboardEntry[] = [
  {
    id: '1',
    username: 'CodeMaster',
    difficulty: 'hard',
    attempts: 3,
    timeInSeconds: 145,
    completedAt: new Date('2024-01-15T10:30:00')
  },
  {
    id: '2',
    username: 'PuzzleWiz',
    difficulty: 'medium',
    attempts: 2,
    timeInSeconds: 89,
    completedAt: new Date('2024-01-14T15:45:00')
  },
  {
    id: '3',
    username: 'ColorCracker',
    difficulty: 'hard',
    attempts: 4,
    timeInSeconds: 203,
    completedAt: new Date('2024-01-13T09:15:00')
  },
  {
    id: '4',
    username: 'LogicLord',
    difficulty: 'easy',
    attempts: 1,
    timeInSeconds: 34,
    completedAt: new Date('2024-01-12T14:20:00')
  },
  {
    id: '5',
    username: 'MindBender',
    difficulty: 'medium',
    attempts: 3,
    timeInSeconds: 156,
    completedAt: new Date('2024-01-11T11:30:00')
  },
  {
    id: '6',
    username: 'PatternPro',
    difficulty: 'hard',
    attempts: 5,
    timeInSeconds: 287,
    completedAt: new Date('2024-01-10T16:45:00')
  },
  {
    id: '7',
    username: 'QuickSolver',
    difficulty: 'easy',
    attempts: 2,
    timeInSeconds: 67,
    completedAt: new Date('2024-01-09T13:10:00')
  },
  {
    id: '8',
    username: 'BrainBox',
    difficulty: 'medium',
    attempts: 4,
    timeInSeconds: 198,
    completedAt: new Date('2024-01-08T12:00:00')
  }
];

const LeaderboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');

  const handleBackToMenu = () => {
    navigate('/');
  };

  const handleStartGame = () => {
    navigate('/');
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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

  const filteredData = selectedDifficulty === 'all'
    ? dummyLeaderboardData
    : dummyLeaderboardData.filter((entry: LeaderboardEntry) => entry.difficulty === selectedDifficulty);

  const sortedData = filteredData.sort((a, b) => {
    // Sort by best score ascending (lowest first), then by games won descending (highest first)
    if (a.bestScore !== b.bestScore) {
      return a.bestScore - b.bestScore;
    }
    return b.gamesWon - a.gamesWon;
  });

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

        {/* Leaderboard Table */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Rank</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Player</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Difficulty</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Attempts</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Time</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((entry, index) => (
                <tr
                  key={entry.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 ${index < 3 ? 'bg-gradient-to-r from-yellow-50 to-transparent' : ''
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
                      {entry.username}
                    </Text>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getDifficultyColor(entry.difficulty)}`}>
                      {entry.difficulty}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <Text variant="body" className="font-medium">
                      {entry.attempts}
                    </Text>
                  </td>
                  <td className="py-4 px-4">
                    <Text variant="body" className="font-mono">
                      {formatTime(entry.timeInSeconds)}
                    </Text>
                  </td>
                  <td className="py-4 px-4">
                    <Text variant="small" color="secondary">
                      {entry.completedAt.toLocaleDateString()}
                    </Text>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {sortedData.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <Heading level={3} className="mb-2 text-gray-600">
              No records found
            </Heading>
            <Text variant="body" color="secondary">
              No games completed for {selectedDifficulty} difficulty yet.
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