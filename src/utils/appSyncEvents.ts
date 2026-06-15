import { events } from 'aws-amplify/data';
import type { EventsChannel } from 'aws-amplify/data';
import type { Color, FeedbackPayload, LeaderboardUpdatePayload } from '../types';
import { getColorById } from '../constants';

export type IAppSyncEventsProvider = AppSyncEventsProvider;

export class AppSyncEventsProvider {
  private _channel: EventsChannel;

  private constructor(channel: EventsChannel) {
    this._channel = channel;
  }

  static async create(gameId: string) {
    const channel = await events.connect(`game/${gameId}`);
    return new AppSyncEventsProvider(channel);
  }

  async publishGuess(guess: Color[]) {
    await this._channel.publish({
      guess: guess.map(color => color.id),
    });
  }

  async subscribeToFeedback(gameId: string, onFeedback: (feedback: FeedbackPayload) => void) {
    const _sub = this._channel.subscribe({
      next: (data: any) => {
        console.log(data.event);
        const guessFeedback: FeedbackPayload = {
          ...data.event,
          guess: data.event.guess.map((color: string) => getColorById(color)),
          secretCode: data.event.secretCode !== null ? data.event.secretCode.map((color: string) => getColorById(color)) : null,
          gameId: gameId
        }
        console.log(guessFeedback);
        onFeedback(guessFeedback);
      },
      error: (error: any) => {
        console.error('AppSync Events subscription error:', error);
      }
    });
    return { _sub, _channel: this._channel }
  }

  static async subscribeToLeaderboard(onUpdate: (update: LeaderboardUpdatePayload) => void) {
    const _channel = await events.connect(`leaderboard/*`);
    
    const _sub = _channel.subscribe({
      next: (data: any) => {
        console.log('Leaderboard update received:', data.event);
        onUpdate(data.event as LeaderboardUpdatePayload);
      },
      error: (error: any) => {
        console.error('Leaderboard subscription error:', error);
      }
    });
    
    return { _sub, _channel };
  }
}
