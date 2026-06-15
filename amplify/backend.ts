import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { validateGuess } from './functions/validate-guess/resource';
import { gameManagement } from './functions/game-management/resource';
import { getLeaderboard } from './functions/get-leaderboard/resource';
import { updateLeaderboard } from './functions/update-leaderboard/resource';

const environment = `${process.env.AWS_BRANCH}-${process.env.ENVIRONMENT}` || 'dev'

const backend = defineBackend({
  auth,
  validateGuess,
  gameManagement,
  getLeaderboard,
  updateLeaderboard,
});