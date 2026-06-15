import type { Color, Difficulty } from '../types';

export const GAME_COLORS: Color[] = [
  { id: 'red', name: 'Red', hex: '#EF4444' },
  { id: 'blue', name: 'Blue', hex: '#3B82F6' },
  { id: 'green', name: 'Green', hex: '#10B981' },
  { id: 'yellow', name: 'Yellow', hex: '#F59E0B' },
  { id: 'purple', name: 'Purple', hex: '#8B5CF6' },
  { id: 'orange', name: 'Orange', hex: '#F97316' },
  { id: 'pink', name: 'Pink', hex: '#EC4899' },
  { id: 'brown', name: 'Brown', hex: '#A16207' },
];

export const getColorById = (id: string): Color | undefined => {
  return GAME_COLORS.find(color => color.id === id);
};

// Game rules and configuration constants
export const GAME_CONSTANTS = {
  MAX_ATTEMPTS: 10,
  DIFFICULTY_SLOTS: {
    easy: 4,
    medium: 6,
    hard: 8,
  } as const,
  TOTAL_COLORS: 8,
} as const;

// Difficulty configuration mapping
export const DIFFICULTY_CONFIG: Record<Difficulty, { slots: number; maxAttempts: number; colors: Color[] }> = {
  easy: {
    slots: GAME_CONSTANTS.DIFFICULTY_SLOTS.easy,
    maxAttempts: GAME_CONSTANTS.MAX_ATTEMPTS,
    colors: GAME_COLORS,
  },
  medium: {
    slots: GAME_CONSTANTS.DIFFICULTY_SLOTS.medium,
    maxAttempts: GAME_CONSTANTS.MAX_ATTEMPTS,
    colors: GAME_COLORS,
  },
  hard: {
    slots: GAME_CONSTANTS.DIFFICULTY_SLOTS.hard,
    maxAttempts: GAME_CONSTANTS.MAX_ATTEMPTS,
    colors: GAME_COLORS,
  },
};

// Export individual constants for convenience
export const MAX_ATTEMPTS = GAME_CONSTANTS.MAX_ATTEMPTS;
export const DIFFICULTY_SLOTS = GAME_CONSTANTS.DIFFICULTY_SLOTS;
export const TOTAL_COLORS = GAME_CONSTANTS.TOTAL_COLORS;