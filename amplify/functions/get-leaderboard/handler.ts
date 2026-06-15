import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

interface LeaderboardItem {
  gamesWon: number;
  bestScore: number;
  difficulty: string;
  [key: string]: any;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,OPTIONS'
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    const difficulty = event.queryStringParameters?.difficulty;

    let scanParams: any = {
      TableName: process.env.LEADERBOARD_TABLE_NAME
    };

    // Only add filter if difficulty is specified
    if (difficulty) {
      scanParams.FilterExpression = 'difficulty = :difficulty';
      scanParams.ExpressionAttributeValues = {
        ':difficulty': difficulty
      };
    }

    const result = await docClient.send(new ScanCommand(scanParams));

    const leaderboard = (result.Items || [])
      .map(item => item as LeaderboardItem)
      .sort((a, b) => {
        if (a.gamesWon !== b.gamesWon) {
          return b.gamesWon - a.gamesWon; // Descending - highest first
        }
        return a.bestScore - b.bestScore; // Ascending - lowest first
      });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ leaderboard })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};