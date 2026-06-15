import type { Difficulty, Color } from '../types';
import { GAME_COLORS, DIFFICULTY_SLOTS } from '../constants';
  
export function generateLocalGameId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateSecretCode(difficulty: Difficulty): Color[] {
  const slots = DIFFICULTY_SLOTS[difficulty];
  const secretCode: Color[] = [];

  for (let i = 0; i < slots; i++) {
    const randomIndex = Math.floor(Math.random() * GAME_COLORS.length);
    secretCode.push(GAME_COLORS[randomIndex]);
  }

  return secretCode;
}