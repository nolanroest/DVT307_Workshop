import { post, get } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import type { Difficulty, CreateGameResponse, GameStatusResponse, LeaderboardEntry, GameListResponse, Guess } from '../types';
import { getColorById } from '../constants';
import outputs from '../../amplify_outputs.json'

export class ApiProvider {
  private static async getAuthHeaders() {
    const session = await fetchAuthSession();
    return {
      Authorization: `Bearer ${session.tokens?.idToken?.toString()}`
    };
  }

  static async createGame(difficulty: Difficulty): Promise<CreateGameResponse> {
    const restResponse = post({
      apiName: `MastermindApi-${outputs.custom?.environment ?? 'dev'}`,
      path: 'mastermind',
      options: {
        headers: await this.getAuthHeaders(),
        body: {
          difficulty,
        }
      },
    });

    const { body } = await restResponse.response;
    return await body.json() as { gameId: string, difficulty: Difficulty };
  }

  static async getGameStatus(gameId: string): Promise<GameStatusResponse | null> {
    try {
      const restResponse = get({
        apiName: `MastermindApi-${outputs.custom?.environment ?? 'dev'}`,
        path: `mastermind/${gameId}`,
        options: {
          headers: await this.getAuthHeaders(),
        }
      });

      const { body } = await restResponse.response;
      const data = await body.json() as { gameState: any };

      const gameState = data.gameState;
      
      // Transform raw guess data to expected format
      const transformedGuesses: Guess[] = (gameState.guesses || []).map((rawGuess: any) => ({
        colors: rawGuess.guess.map((colorId: string) => getColorById(colorId)).filter(Boolean),
        feedback: {
          correctPosition: rawGuess.blackPegs || 0,
          correctColor: rawGuess.whitePegs || 0,
        }
      }));

      return {
        secretCode: gameState.secretCode ? gameState.secretCode.map((colorId: string) => getColorById(colorId)) : null,
        gameId: gameState.gameId,
        difficulty: gameState.difficulty,
        guesses: transformedGuesses,
        status: gameState.gameStatus || 'playing',
        attemptsRemaining: gameState.attemptsRemaining || 10,
      };
    } catch (error) {
      console.error('Failed to get game status:', error);
      return null;
    }
  }

  static async getLeaderboard(difficulty?: Difficulty): Promise<LeaderboardEntry[]> {
    try {
      const queryParams = new URLSearchParams();
      if (difficulty) {
        queryParams.append('difficulty', difficulty);
      }
      queryParams.append('limit', '50');

      const restResponse = get({
        apiName: `MastermindApi-${outputs.custom?.environment ?? 'dev'}`,
        path: `mastermind/leaderboard?${queryParams.toString()}`,
        options: {
          headers: await this.getAuthHeaders(),
        }
      });

      const { body } = await restResponse.response;
      const data = await body.json() as { leaderboard: any };
      const leaderboardRes = data.leaderboard as LeaderboardEntry[];

      if (leaderboardRes.length === 0) {
        return [];
      }

      return leaderboardRes;
    } catch (error) {
      console.error('Failed to get leaderboard:', error);
      return [];
    }
  }

  static async getGames(difficulty?: Difficulty, limit: number = 50, lastEvaluatedKey?: string): Promise<GameListResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (difficulty) {
        queryParams.append('difficulty', difficulty);
      }
      queryParams.append('limit', limit.toString());
      if (lastEvaluatedKey) {
        queryParams.append('lastEvaluatedKey', lastEvaluatedKey);
      }

      const restResponse = get({
        apiName: `MastermindApi-${outputs.custom?.environment ?? 'dev'}`,
        path: `mastermind?${queryParams.toString()}`,
        options: {
          headers: await this.getAuthHeaders(),
        }
      });

      const { body } = await restResponse.response;
      const data = await body.json() as any;

      return {
        games: data.games || [],
        count: data.count || 0,
        lastEvaluatedKey: data.lastEvaluatedKey
      };
    } catch (error) {
      console.error('Failed to get games:', error);
      return {
        games: [],
        count: 0
      };
    }
  }
}
