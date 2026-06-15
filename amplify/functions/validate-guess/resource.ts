import { defineFunction } from '@aws-amplify/backend';

export const validateGuess = defineFunction({
  name: 'validate-guess',
  entry: './handler.ts',
  timeoutSeconds: 15,
  resourceGroupName: `MastermindShared`
});