import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { validateGuess } from './functions/validate-guess/resource';
import { gameManagement } from './functions/game-management/resource';
import { getLeaderboard } from './functions/get-leaderboard/resource';
import { updateLeaderboard } from './functions/update-leaderboard/resource';
import { DynamoDBConstruct } from './custom/dynamodb/resource';
import { StartingPosition } from 'aws-cdk-lib/aws-lambda';
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { RestApiConstruct } from './custom/rest-api/resource';
import { AppSyncEventsConstruct } from './custom/appsync-events/resource';

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

// Define REST API construct
const restApiConstruct = new RestApiConstruct(sharedStack, `MastermindRestApi-${environment}`, {
  environment: environment.replace(/-/g, ''),
  gameManagementFunction: backend.gameManagement.resources.lambda,
  getLeaderboardFunction: backend.getLeaderboard.resources.lambda,
  userPool: backend.auth.resources.userPool,
  gameStateTable: ddbConstruct.gamesTable,
  leaderboardTable: ddbConstruct.leaderboardTable
});

// Define Event API construct
const eventApiConstruct = new AppSyncEventsConstruct(sharedStack, `MastermindEventApi-${environment}`, {
  environment: environment,
  userPool: backend.auth.resources.userPool,
  validateGuess: backend.validateGuess.resources.lambda,
});

// Add AppSync Events endpoint & API Key to update-leaderboard function
backend.updateLeaderboard.addEnvironment('APPSYNC_EVENTS_ENDPOINT', `https://${eventApiConstruct.eventApi.httpDns}/event`);
backend.updateLeaderboard.addEnvironment('APPSYNC_EVENTS_API_KEY', eventApiConstruct.eventApi.apiKeys['Default'].attrApiKey);

// add outputs to the configuration file
backend.addOutput({
  custom: {
    environment: environment.replace(/-/g, ''),
    API: {
      [restApiConstruct.restApi.restApiName]: {
        endpoint: restApiConstruct.restApi.url,
        region: backend.stack.region,
        apiName: restApiConstruct.restApi.restApiName,
      },
    },
    events: {
      endpoint: `https://${eventApiConstruct.eventApi.httpDns}/event`,
      region: backend.stack.region
    }
  },
});