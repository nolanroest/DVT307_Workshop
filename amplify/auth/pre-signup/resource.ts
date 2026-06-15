import { defineFunction } from '@aws-amplify/backend';

export const preSignUp = defineFunction({
  name: 'auth-pre-signup',
  entry: './handler.ts',
});