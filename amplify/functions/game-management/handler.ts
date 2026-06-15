import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

interface Color {
  id: string;
  name: string;
  hex: string;
}

type Difficulty = 'easy' | 'medium' | 'hard';

interface CreateGameRequest {
  difficulty: Difficulty;
  userId: string;
}

interface GameListItem {
  gameId: string;
  difficulty: Difficulty;
  status: string;
  createdAt: string;
  updatedAt?: string;
  totalGuesses?: number;
}

interface GameListResponse {
  games: GameListItem[];
  count: number;
  lastEvaluatedKey?: string;
}

const GAME_COLORS: Color[] = [
  { id: 'red', name: 'Red', hex: '#EF4444' },
  { id: 'blue', name: 'Blue', hex: '#3B82F6' },
  { id: 'green', name: 'Green', hex: '#10B981' },
  { id: 'yellow', name: 'Yellow', hex: '#F59E0B' },
  { id: 'purple', name: 'Purple', hex: '#8B5CF6' },
  { id: 'orange', name: 'Orange', hex: '#F97316' },
  { id: 'pink', name: 'Pink', hex: '#EC4899' },
  { id: 'brown', name: 'Brown', hex: '#A16207' },
];

const DIFFICULTY_CONFIG: Record<Difficulty, { slots: number }> = {
  easy: { slots: 4 },
  medium: { slots: 6 },
  hard: { slots: 8 },
};

function generateSecretCode(difficulty: Difficulty): string[] {
  const { slots } = DIFFICULTY_CONFIG[difficulty];
  const secretCode: string[] = [];
  
  for (let i = 0; i < slots; i++) {
    const randomIndex = Math.floor(Math.random() * GAME_COLORS.length);
    secretCode.push(GAME_COLORS[randomIndex].id);
  }
  
  return secretCode;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'POST,GET,OPTIONS',
};

export const handler: APIGatewayProxyHandler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  const userId = event.requestContext.authorizer?.claims?.sub;
  const username = event.requestContext.authorizer?.claims?.preferred_username;

  try {
    // POST /mastermind - Create game
    if (event.httpMethod === 'POST' && event.resource === '/mastermind') {
      const body: CreateGameRequest = JSON.parse(event.body || '{}');
      console.log(body);
      if (!body.difficulty || !userId) {
        return {
          statusCode: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Missing difficulty or userId' }),
        };
      }

      const gameId = randomUUID();
      const secretCode = generateSecretCode(body.difficulty);
      const startedAt = new Date().toISOString();
      const ttl = Math.floor(Date.now() / 1000) + (60 * 60); // 1 hour from now

      await docClient.send(new PutCommand({
        TableName: process.env.GAMES_TABLE_NAME,
        Item: {
          gameId,
          userId: userId,
          username,
          secretCode,
          difficulty: body.difficulty,
          startedAt,
          gameStatus: 'playing',
          ttl,
        },
      }));

      return {
        statusCode: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, difficulty: body.difficulty }),
      };
    }

    // GET /mastermind - List user games
    if (event.httpMethod === 'GET' && event.resource === '/mastermind') {
      if (!userId) {
        return {
          statusCode: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Unauthorized' }),
        };
      }

      const difficulty = event.queryStringParameters?.difficulty as Difficulty | undefined;
      const limit = parseInt(event.queryStringParameters?.limit || '50');
      const lastEvaluatedKey = event.queryStringParameters?.lastEvaluatedKey;

      try {
        const queryParams: any = {
          TableName: process.env.GAMES_TABLE_NAME,
          IndexName: 'UserGamesIndex',
          KeyConditionExpression: 'userId = :userId',
          ExpressionAttributeValues: {
            ':userId': userId,
          },
          ScanIndexForward: false, // Sort in descending order (newest first)
          Limit: limit,
        };

        // Add difficulty filter if specified
        if (difficulty) {
          queryParams.FilterExpression = 'difficulty = :difficulty';
          queryParams.ExpressionAttributeValues[':difficulty'] = difficulty;
        }

        // Add pagination if provided
        if (lastEvaluatedKey) {
          try {
            queryParams.ExclusiveStartKey = JSON.parse(decodeURIComponent(lastEvaluatedKey));
          } catch (e) {
            return {
              statusCode: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              body: JSON.stringify({ error: 'Invalid lastEvaluatedKey' }),
            };
          }
        }

        const result = await docClient.send(new QueryCommand(queryParams));

        const games: GameListItem[] = (result.Items || []).map(item => ({
          gameId: item.gameId,
          difficulty: item.difficulty,
          status: item.gameStatus || 'playing',
          createdAt: item.startedAt,
          updatedAt: item.updatedAt,
          totalGuesses: item.totalGuesses || 0,
        }));

        const response: GameListResponse = {
          games,
          count: games.length,
        };

        if (result.LastEvaluatedKey) {
          response.lastEvaluatedKey = encodeURIComponent(JSON.stringify(result.LastEvaluatedKey));
        }

        return {
          statusCode: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify(response),
        };

      } catch (error) {
        console.error('Error querying games:', error);
        return {
          statusCode: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Failed to retrieve games' }),
        };
      }
    }

    // GET /mastermind/{gameId} - Get game status
    if (event.httpMethod === 'GET' && event.resource === '/mastermind/{gameId}') {
      const gameId = event.pathParameters?.gameId;

      if (!userId) {
        return {
          statusCode: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Unauthorized' }),
        };
      }

      const result = await docClient.send(new GetCommand({
        TableName: process.env.GAMES_TABLE_NAME,
        Key: { gameId, userId },
      }));

      if (!result.Item) {
        return {
          statusCode: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Game not found' }),
        };
      }

      // Aggregate guess1-guess10 into guesses array
      const guesses = [];
      const totalGuesses = result.Item.totalGuesses || 0;
      if (result.Item.gameStatus === 'playing') {
        delete result.Item.secretCode;
      }
      
      for (let i = 1; i <= totalGuesses; i++) {
        const guessKey = `guess${i}`;
        if (result.Item[guessKey]) {
          guesses.push(result.Item[guessKey]);
          delete result.Item[guessKey];
        }
      }

      const gameState = {
        ...result.Item,
        guesses,
      };

      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameState }),
      };
    }

    // Route not found
    return {
      statusCode: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Route not found' }),
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};