import { DynamoDBStreamHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

interface LeaderboardEntry {
  userId: string;
  difficulty: string;
  gamesWon: number;
  totalGames: number;
  bestScore: number;
  averageScore: number;
  lastWonAt: string;
  username?: string;
}

async function publishToAppSyncEvents(updatedEntry: LeaderboardEntry) {
  const eventsEndpoint = process.env.APPSYNC_EVENTS_ENDPOINT;
  const eventsApiKey = process.env.APPSYNC_EVENTS_API_KEY;
  
  if (!eventsEndpoint || !eventsApiKey) {
    console.log('AppSync Events not configured, skipping publish');
    return;
  }

  try {
    const response = await fetch(eventsEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': eventsApiKey,
      },
      body: JSON.stringify({
        channel: `/leaderboard/${updatedEntry.difficulty}`,
        events: [JSON.stringify(updatedEntry)]
      }),
    });

    if (!response.ok) {
      console.error('Failed to publish to AppSync Events:', response.status, await response.text());
    } else {
      console.log('Successfully published leaderboard update to AppSync Events');
    }
  } catch (error) {
    console.error('Error publishing to AppSync Events:', error);
  }
}

export const handler: DynamoDBStreamHandler = async (event) => {
  console.log('Processing DynamoDB stream event:', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    if (record.eventName === 'MODIFY' && record.dynamodb?.NewImage) {
      const newImage = record.dynamodb.NewImage;
      
      // Check if the game was just completed (status changed to 'won')
      const status = newImage.gameStatus?.S;
      const userId = newImage.userId?.S;
      const username = newImage.username?.S;
      const difficulty = newImage.difficulty?.S;
      const totalGuesses = newImage.totalGuesses?.N;
      
      if (status === 'won' && userId && difficulty && totalGuesses) {
        console.log(`Game won by user ${userId} in ${totalGuesses} guesses on ${difficulty} difficulty`);
        
        try {
          // Get current leaderboard entry
          const getResult = await docClient.send(new GetCommand({
            TableName: process.env.LEADERBOARD_TABLE_NAME,
            Key: { userId, difficulty },
          }));

          const currentEntry = getResult.Item as LeaderboardEntry | undefined;
          const score = parseInt(totalGuesses);
          const now = new Date().toISOString();

          let updatedEntry: LeaderboardEntry;

          if (currentEntry) {
            // Update existing entry
            const newTotalGames = currentEntry.totalGames + 1;
            const newGamesWon = currentEntry.gamesWon + 1;
            const newBestScore = Math.min(currentEntry.bestScore, score);
            const newAverageScore = Math.round(
              ((currentEntry.averageScore * currentEntry.gamesWon) + score) / newGamesWon
            );

            updatedEntry = {
              ...currentEntry,
              gamesWon: newGamesWon,
              totalGames: newTotalGames,
              bestScore: newBestScore,
              averageScore: newAverageScore,
              lastWonAt: now,
            };
          } else {
            // Create new entry
            updatedEntry = {
              userId,
              username,
              difficulty,
              gamesWon: 1,
              totalGames: 1,
              bestScore: score,
              averageScore: score,
              lastWonAt: now,
            };
          }

          // Save updated entry
          await docClient.send(new PutCommand({
            TableName: process.env.LEADERBOARD_TABLE_NAME,
            Item: updatedEntry,
          }));

          console.log(`Updated leaderboard for user ${userId}:`, updatedEntry);

          // Publish update to AppSync Events
          await publishToAppSyncEvents(updatedEntry);

        } catch (error) {
          console.error('Error updating leaderboard:', error);
        }
      }
    }
  }
};