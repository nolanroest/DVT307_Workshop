import { defineAuth } from '@aws-amplify/backend';
import { preSignUp } from './pre-signup/resource';

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userAttributes: {
    preferredUsername: {
      mutable: true,
      required: true
    }
  },
  triggers: {
    preSignUp: preSignUp
  }
});