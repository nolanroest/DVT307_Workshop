import { defineFunction } from '@aws-amplify/backend';

export const gameManagement = defineFunction({
  name: 'game-management',
  entry: './handler.ts',
  timeoutSeconds: 15,
  resourceGroupName: `MastermindShared`
});