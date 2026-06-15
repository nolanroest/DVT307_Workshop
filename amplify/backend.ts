import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { validateGuess } from './functions/validate-guess/resource';
import { gameManagement } from './functions/game-management/resource';
import { getLeaderboard } from './functions/get-leaderboard/resource';
import { updateLeaderboard } from './functions/update-leaderboard/resource';
import { DynamoDBConstruct } from './custom/dynamodb/resource';
import { StartingPosition } from 'aws-cdk-lib/aws-lambda';
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

const environment = `${process.env.AWS_BRANCH}-${process.env.ENVIRONMENT}` || 'dev'

const backend = defineBackend({
  auth,
  validateGuess,
  gameManagement,
  getLeaderboard,
  updateLeaderboard,
});

// retrieve shared resource stack
const sharedStack = backend.gameManagement.stack;

// Define DynamoDB construct
const ddbConstruct = new DynamoDBConstruct(sharedStack, `MastermindDynamoDB-${environment}`, {
  environment: environment
});

// Add table names as environment variables to AWS Lambda functions
backend.gameManagement.addEnvironment('GAMES_TABLE_NAME', ddbConstruct.gamesTable.tableName);
backend.validateGuess.addEnvironment('GAMES_TABLE_NAME', ddbConstruct.gamesTable.tableName);
backend.validateGuess.addEnvironment('LEADERBOARD_TABLE_NAME', ddbConstruct.leaderboardTable.tableName);
backend.updateLeaderboard.addEnvironment('LEADERBOARD_TABLE_NAME', ddbConstruct.leaderboardTable.tableName);
backend.getLeaderboard.addEnvironment('LEADERBOARD_TABLE_NAME', ddbConstruct.leaderboardTable.tableName);

// Add permissions for Lambda functions to read/write to DynamoDB tables
ddbConstruct.gamesTable.grantReadWriteData(backend.gameManagement.resources.lambda);
ddbConstruct.gamesTable.grantReadWriteData(backend.validateGuess.resources.lambda);
ddbConstruct.leaderboardTable.grantReadWriteData(backend.updateLeaderboard.resources.lambda);
ddbConstruct.leaderboardTable.grantReadData(backend.getLeaderboard.resources.lambda);

// Add DynamoDB Stream trigger for leaderboard updates
backend.updateLeaderboard.resources.lambda.addEventSource(
  new DynamoEventSource(ddbConstruct.gamesTable, {
    startingPosition: StartingPosition.LATEST,
    batchSize: 10,
    retryAttempts: 3
  })
);