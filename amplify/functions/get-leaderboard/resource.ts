import { defineFunction } from '@aws-amplify/backend';

export const getLeaderboard = defineFunction({
  name: 'get-leaderboard',
  entry: './handler.ts',
  resourceGroupName: `MastermindShared`
});