import { Construct } from 'constructs';
import { IUserPool } from 'aws-cdk-lib/aws-cognito';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { TableV2 } from 'aws-cdk-lib/aws-dynamodb';
import {
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
  Cors,
  LambdaIntegration,
  JsonSchemaVersion,
  JsonSchemaType,
  RestApi,
  Model,
  RequestValidator
} from "aws-cdk-lib/aws-apigateway";

export type RestApiProps = {
  /**
   * Environment
   */
  environment: string;

  /**
   * Amazon Cognito user pool
   */
  userPool: IUserPool;

  /**
   * AWS Lambda function - gameManagement
   */
  gameManagementFunction: IFunction;

  /**
   * AWS Lambda function - getLeaderboard
   */
  getLeaderboardFunction: IFunction;

  /**
   * Amazon DynamoDB - game state table
   */
  gameStateTable: TableV2;

  /**
   * Amazon DynamoDB - leaderboard table
   */
  leaderboardTable: TableV2;
}

export class RestApiConstruct extends Construct {
  public readonly restApi: RestApi;
  constructor(scope: Construct, id: string, props: RestApiProps) {
    super(scope, id);

    // create a new REST API
    this.restApi = new RestApi(this, `MastermindApi-${props.environment}`, {
      restApiName: `MastermindApi-${props.environment}`,
      deploy: true,
      deployOptions: {
        stageName: props.environment,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: Cors.DEFAULT_HEADERS,
      },
    });

    // create a new Cognito User Pool authorizer
    const cognitoAuth = new CognitoUserPoolsAuthorizer(this, `CognitoAuth-${props.environment}`, {
      cognitoUserPools: [props.userPool],
    });

    // create a new Lambda integration
    const lambdaIntegration = new LambdaIntegration(props.gameManagementFunction, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
      integrationResponses: [
        {
          statusCode: '200',
          responseTemplates: {
            'application/json': '',
          },
        },
        {
          statusCode: '400',
          selectionPattern: '.*"statusCode":400.*',
          responseTemplates: {
            'application/json': '{"message": "Bad Request"}',
          },
        },
        {
          statusCode: '401',
          selectionPattern: '.*"statusCode":401.*',
          responseTemplates: {
            'application/json': '{"message": "Unauthorized"}',
          },
        },
        {
          statusCode: '500',
          selectionPattern: '.*"statusCode":500.*',
          responseTemplates: {
            'application/json': '{"message": "Internal Server Error"}',
          },
        },
      ],
    });

    // define input request model for POST /mastermind resource
    const createGameModel = this.restApi.addModel(`CreateGameModel-${props.environment}`, {
      contentType: 'application/json',
      modelName: `CreateGameModel${props.environment}`,
      schema: {
        schema: JsonSchemaVersion.DRAFT4,
        title: 'Create Game Request',
        type: JsonSchemaType.OBJECT,
        properties: {
          difficulty: {
            type: JsonSchemaType.STRING,
            description: 'Game difficulty'
          },
        },
        additionalProperties: false,
      },
    });

    // define reusable error model
    const errorResponseModel = this.restApi.addModel('ErrorResponse', {
      contentType: 'application/json',
      modelName: 'ErrorResponse',
      schema: {
        schema: JsonSchemaVersion.DRAFT4,
        title: 'Error Response',
        type: JsonSchemaType.OBJECT,
        properties: {
          message: { type: JsonSchemaType.STRING },
          error: { type: JsonSchemaType.STRING },
        },
        required: ['message'],
      },
    });

    // define request validators
    const requestValidator = new RequestValidator(this, `RequestValidator-${props.environment}`, {
      restApi: this.restApi,
      requestValidatorName: `MastermindRequestValidator-${props.environment}`,
      validateRequestBody: true,
      validateRequestParameters: true,
    });

    // Create parameter validator for gameId format (UUID)
    const gameIdParameterValidator = new RequestValidator(this, `GameIdParameterValidator-${props.environment}`, {
      restApi: this.restApi,
      requestValidatorName: `GameIdParameterValidator--${props.environment}`,
      validateRequestBody: false,
      validateRequestParameters: true,
    });

    // define mastermind resource & POST method
    const mastermindResource = this.restApi.root.addResource("mastermind");
    mastermindResource.addMethod('POST', lambdaIntegration, {
      authorizationType: AuthorizationType.COGNITO,
      authorizer: cognitoAuth,
      requestValidator,
      requestModels: {
        'application/json': createGameModel,
      },
      methodResponses: [
        {
          statusCode: '200',
          responseModels: {
            'application/json': Model.EMPTY_MODEL,
          },
        },
        {
          statusCode: '400',
          responseModels: {
            'application/json': errorResponseModel,
          },
        },
        {
          statusCode: '401',
          responseModels: {
            'application/json': errorResponseModel,
          },
        },
        {
          statusCode: '500',
          responseModels: {
            'application/json': errorResponseModel,
          },
        },
      ],
    });

    // GET /mastermind - List user games
    mastermindResource.addMethod('GET', lambdaIntegration, {
      authorizationType: AuthorizationType.COGNITO,
      authorizer: cognitoAuth,
      requestParameters: {
        'method.request.querystring.difficulty': false,
        'method.request.querystring.limit': false,
        'method.request.querystring.lastEvaluatedKey': false,
      },
      methodResponses: [
        {
          statusCode: '200',
          responseModels: {
            'application/json': Model.EMPTY_MODEL,
          },
        },
        {
          statusCode: '400',
          responseModels: {
            'application/json': errorResponseModel,
          },
        },
        {
          statusCode: '401',
          responseModels: {
            'application/json': errorResponseModel,
          },
        },
        {
          statusCode: '500',
          responseModels: {
            'application/json': errorResponseModel,
          },
        },
      ],
    });

    // define {gameId} resource under /mastermind
    const gameIdResource = mastermindResource.addResource('{gameId}');

    // GET /mastermind/{gameId} - Lambda integration (handled by same function)
    gameIdResource.addMethod('GET', lambdaIntegration, {
      authorizationType: AuthorizationType.COGNITO,
      authorizer: cognitoAuth,
      requestValidator: gameIdParameterValidator,
      requestParameters: {
        'method.request.path.gameId': true,
      },
      methodResponses: [
        {
          statusCode: '200',
          responseModels: {
            'application/json': Model.EMPTY_MODEL,
          },
        },
        {
          statusCode: '404',
          responseModels: {
            'application/json': errorResponseModel,
          },
        },
        {
          statusCode: '500',
          responseModels: {
            'application/json': errorResponseModel,
          },
        },
      ],
    });

    // define leaderboard resource under /mastermind/leaderboard
    const leaderboardResource = mastermindResource.addResource('leaderboard');

    // GET /mastermind/leaderboard - Lambda integration
    const getLeaderboardIntegration = new LambdaIntegration(props.getLeaderboardFunction, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
      integrationResponses: [
        {
          statusCode: '200',
          responseTemplates: {
            'application/json': '',
          },
        },
        {
          statusCode: '500',
          selectionPattern: '.*"statusCode":500.*',
          responseTemplates: {
            'application/json': '{"message": "Internal Server Error"}',
          },
        },
      ],
    });

    leaderboardResource.addMethod('GET', getLeaderboardIntegration, {
      authorizationType: AuthorizationType.COGNITO,
      authorizer: cognitoAuth,
      requestParameters: {
        'method.request.querystring.difficulty': false,
        'method.request.querystring.limit': false,
        'method.request.querystring.lastEvaluatedKey': false,
      },
      methodResponses: [
        {
          statusCode: '200',
          responseModels: {
            'application/json': Model.EMPTY_MODEL,
          },
        },
        {
          statusCode: '500',
          responseModels: {
            'application/json': errorResponseModel,
          },
        },
      ],
    });
  }
}