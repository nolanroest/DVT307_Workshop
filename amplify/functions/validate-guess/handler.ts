import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import type { Context } from 'aws-lambda';

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

interface ValidateGuessInput {
  guess: string[];
}

async function processEvent(payload: ValidateGuessInput, gameId: string, userId: string) {
  // Fetch game from DynamoDB
  const getCommand = new GetCommand({
    TableName: process.env.GAMES_TABLE_NAME,
    Key: { gameId, userId }
  });

  const gameResult = await client.send(getCommand);

  if (!gameResult.Item) {
    throw new Error('Game not found');
  }

  const { secretCode, totalGuesses = 0 } = gameResult.Item;
  const guessNumber = totalGuesses + 1;

  // Calculate feedback using same logic as GameContext
  let correctPosition = 0;
  let correctColor = 0;

  // Count exact matches
  for (let i = 0; i < payload.guess.length; i++) {
    if (payload.guess[i] === secretCode[i]) {
      correctPosition++;
    }
  }

  // Count color matches
  const secretIds = structuredClone(secretCode);
  const guessIds = payload.guess;

  for (const guessId of guessIds) {
    const secretIndex = secretIds.indexOf(guessId);
    if (secretIndex !== -1) {
      correctColor++;
      secretIds[secretIndex] = ''; // Mark as used
    }
  }

  correctColor -= correctPosition; // Remove exact matches from color count
  
  // Update game status if game is won or lost
  let gameStatus;
  if (correctPosition === secretCode.length) {
    gameStatus = 'won';
  } else if (guessNumber >= 10) {
    gameStatus = 'lost';
  } else {
    gameStatus = 'playing';
  }

  // Update DynamoDB with guess
  const res = await docClient.send(new UpdateCommand({
    TableName: process.env.GAMES_TABLE_NAME,
    Key: { gameId, userId },
    UpdateExpression: `SET guess${guessNumber} = :guess, totalGuesses = :total, gameStatus = :gameStatus`,
    ExpressionAttributeValues: {
      ':guess': {
        guess: payload.guess,
        blackPegs: correctPosition,
        whitePegs: correctColor,
      },
      ':total': guessNumber,
      ':gameStatus': gameStatus
    },
  }));

  let returnSecretCode;
  if (gameStatus === 'won') {
    returnSecretCode = secretCode;
  } else if (gameStatus === 'lost') {
    returnSecretCode = secretCode;
  } else {
    returnSecretCode = null;
  }

  return {
    ...payload,
    blackPegs: correctPosition,
    whitePegs: correctColor,
    guessNumber,
    gameStatus,
    secretCode: returnSecretCode
  }
}

export const handler = async (event: any, context: Context) => {
  console.log(event.events);
  if (event.info.operation === 'PUBLISH') {
    console.log('Received publish');
    const userId = event.identity.sub;
    const gameId = event.info.channel.path.slice(6);

    console.log(`User ID: ${userId} Game ID: ${gameId}`);

    const events = event.events.map(async (_event: any) => {
      const responsePayload = await processEvent(_event.payload, gameId, userId);
      return {
        id: _event.id,
        payload: {
          ...responsePayload
        }
      }
    });

    const resolvedEvents = await Promise.all(events);

    return { events: resolvedEvents };
  }

  return { events: event.events };
}