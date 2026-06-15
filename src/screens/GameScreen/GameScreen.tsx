import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../../hooks/useGame';
import { useGameActions } from '../../hooks/useGameActions';
import GameBoard from '../../components/GameBoard/GameBoard';
import ColorPicker from '../../components/ColorPicker/ColorPicker';
import { Button, Container, Heading, Text } from '../../components/common';
import type { Color } from '../../types';
import { useGameContext } from '../../context';

interface GameCompletionModalProps {
  isOpen: boolean;
  isWon: boolean;
  secretCode: Color[];
  attemptsUsed: number;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

const GameCompletionModal: React.FC<GameCompletionModalProps> = ({
  isOpen,
  isWon,
  secretCode,
  attemptsUsed,
  onPlayAgain,
  onBackToMenu,
}) => {
  const playAgainRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (isOpen && playAgainRef.current) {
      // Focus the primary action when modal opens
      playAgainRef.current.focus();
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onBackToMenu();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      onKeyDown={handleKeyDown}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6">
        <div className="text-center">
          <div 
            className="text-4xl sm:text-6xl mb-3 sm:mb-4"
            role="img"
            aria-label={isWon ? "Celebration emoji" : "Sad emoji"}
          >
            {isWon ? '🎉' : '💔'}
          </div>

          <Heading 
            level={2} 
            className="mb-2 text-xl sm:text-2xl"
            id="modal-title"
          >
            {isWon ? 'Congratulations!' : 'Game Over'}
          </Heading>

          <Text 
            variant="body" 
            className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base"
            id="modal-description"
          >
            {isWon
              ? `You cracked the code in ${attemptsUsed} attempt${attemptsUsed !== 1 ? 's' : ''}!`
              : 'Better luck next time!'
            }
          </Text>

          {/* Secret code reveal */}
          <div className="mb-4 sm:mb-6">
            <Text 
              variant="body" 
              className="text-gray-700 mb-3 font-medium text-sm sm:text-base"
              id="secret-code-label"
            >
              The secret code was:
            </Text>
            <div 
              className="flex justify-center gap-1 sm:gap-2"
              role="group"
              aria-labelledby="secret-code-label"
            >
              {secretCode.map((color, index) => (
                <div
                  key={index}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-gray-300 shadow-sm"
                  style={{ backgroundColor: color.hex }}
                  role="img"
                  aria-label={`Position ${index + 1}: ${color.name}`}
                />
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div 
            className="flex flex-col sm:flex-row gap-2 sm:gap-3"
            role="group"
            aria-label="Game completion actions"
          >
            <Button
              ref={playAgainRef}
              variant="primary"
              onClick={onPlayAgain}
              className="flex-1 text-sm sm:text-base"
              aria-describedby="modal-description"
            >
              Play Again
            </Button>
            <Button
              variant="outline"
              onClick={onBackToMenu}
              className="flex-1 text-sm sm:text-base"
            >
              Back to Menu
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const GameScreen: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<{ gameId: string }>();
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const {
    gameId,
    difficulty,
    secretCode,
    isGameActive,
    isGameComplete,
    isGameWon,
    attemptsUsed,
    canBackspace,
    canSubmit,
    nextEmptySlotIndex,
  } = useGame();

  const {
    addColorToGuess,
    removeLastColor,
    resetGame,
    submitGuess,
  } = useGameActions();

  const {
    startGame,
    loadGame,
  } = useGameContext();

  // Load game when component mounts or gameId changes
  useEffect(() => {
    const gameIdFromParams = params.gameId;
    if (gameIdFromParams) {
      loadGame(gameIdFromParams);
    }
  }, [params.gameId, loadGame]);

  // Show completion modal when game ends
  useEffect(() => {
    if (isGameComplete) {
      setShowCompletionModal(true);
    }
  }, [isGameComplete]);

  // Show message if no game is active
  if (!gameId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <Container size="md" padding="lg" className="text-center">
            <Heading level={2} className="mb-4">No Game Active</Heading>
            <Text variant="body" className="mb-6">
              You need to start a game first. Go back to the main menu to begin.
            </Text>
            <Button variant="primary" onClick={() => navigate('/')}>
              Back to Menu
            </Button>
          </Container>
        </div>
      </div>
    );
  }

  const handleColorSelect = (color: Color) => {
    if (isGameActive) {
      addColorToGuess(color);
    }
  };

  const handleBackspace = () => {
    if (isGameActive && canBackspace) {
      removeLastColor();
    }
  };

  const handlePlayAgain = async () => {
    setShowCompletionModal(false);
    resetGame();
    const { gameId } = await startGame(difficulty);
    navigate(`/game/${gameId}`)
  };

  const handleBackToMenu = () => {
    resetGame();
    navigate('/');
  };

  return (
    <div className="h-screen bg-gray-50 overflow-hidden pt-16">
      <div className="h-full flex flex-col">
        <Container size="full" padding="md" className="max-w-3xl mx-auto flex-1 flex flex-col min-h-0">
        {/* Skip to main content link for keyboard users */}
        <a 
          href="#main-game-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
        >
          Skip to main game content
        </a>

        {/* Main Game Content - takes remaining space */}
        <main id="main-game-content" role="main" aria-label="Mastermind game board" className="flex-1 min-h-0">
          <div className="overflow-y-auto pb-4 h-full" style={{ paddingBottom: isGameActive ? '180px' : '0px' }}>
            <GameBoard />
          </div>
        </main>
        </Container>
      </div>

        {/* Bottom Color Picker - fixed at bottom */}
        {isGameActive && (
          <div 
            className="fixed bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-200 p-2 sm:p-4 shadow-lg z-10"
            role="region"
            aria-label="Color selection area"
          >
            <div className="max-w-4xl mx-auto">
              <div className="mb-2 text-center">
                <Text 
                  variant="body" 
                  className="text-gray-600 text-xs sm:text-sm"
                  id="color-picker-status"
                  aria-live="polite"
                >
                  {nextEmptySlotIndex !== -1 
                    ? `Click a color to fill slot ${nextEmptySlotIndex + 1}` 
                    : 'Your guess is complete! Submit when ready.'
                  }
                </Text>
              </div>
              <ColorPicker
                onColorSelect={handleColorSelect}
                onBackspace={handleBackspace}
                canBackspace={canBackspace}
                onSubmit={submitGuess}
                canSubmit={canSubmit}
                className="max-w-3xl mx-auto"
                autoFocus={nextEmptySlotIndex === 0} // Auto-focus when starting new guess
              />
            </div>
          </div>
        )}

      <GameCompletionModal
        isOpen={showCompletionModal}
        isWon={isGameWon}
        secretCode={secretCode}
        attemptsUsed={attemptsUsed}
        onPlayAgain={handlePlayAgain}
        onBackToMenu={handleBackToMenu}
      />
    </div>
  );
};

export default GameScreen;