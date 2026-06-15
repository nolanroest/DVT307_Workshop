import { Construct } from 'constructs';
import { IUserPool } from 'aws-cdk-lib/aws-cognito';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { 
  EventApi,
  AppSyncAuthProvider,
  AppSyncAuthorizationType,
  AppSyncFieldLogLevel
} from 'aws-cdk-lib/aws-appsync';

export type AppSyncEventsConstructProps = {
  /**
   * Environment
   */
  environment: string;

  /**
   * Amazon Cognito user pool
   */
  userPool: IUserPool;

  /**
   * AWS Lambda function - validateGuess
   */
  validateGuess: IFunction;
}
export class AppSyncEventsConstruct extends Construct {
  public readonly eventApi: EventApi;
  constructor(scope: Construct, id: string, props: AppSyncEventsConstructProps) {
    super(scope, id);

    // define API Key auth provider
    const apiKeyProvider: AppSyncAuthProvider = {
      authorizationType: AppSyncAuthorizationType.API_KEY
    };

    // define Cognito user pool provider
    const cognitoProvider: AppSyncAuthProvider = {
      authorizationType: AppSyncAuthorizationType.USER_POOL,
      cognitoConfig: {
        userPool: props.userPool
      }
    };

    // create AppSync Event API
    this.eventApi = new EventApi(this, `MastermindEventApi-${props.environment}`, {
      apiName: `MastermindEventApi-${props.environment}`,
      authorizationConfig: {
        authProviders: [
          apiKeyProvider,
          cognitoProvider,
        ],
        connectionAuthModeTypes: [
          AppSyncAuthorizationType.USER_POOL,
        ],
        defaultPublishAuthModeTypes: [
          AppSyncAuthorizationType.USER_POOL,
        ],
        defaultSubscribeAuthModeTypes: [
          AppSyncAuthorizationType.USER_POOL,
        ],
      },
      logConfig: {
        fieldLogLevel: props.environment === 'dev' ? AppSyncFieldLogLevel.ALL : AppSyncFieldLogLevel.ERROR,
        retention: props.environment === 'dev' ? RetentionDays.ONE_WEEK : RetentionDays.ONE_MONTH
      }
    });

    // define data sources
    const validateGuessDS = this.eventApi.addLambdaDataSource('MastermindValidateGuessFunc', props.validateGuess);

    // define Game namespace (existing single-player)
    this.eventApi.addChannelNamespace('game', {
      publishHandlerConfig: {
        dataSource: validateGuessDS,
        direct: true
      }
    });

    // define Leaderboard namespace
    this.eventApi.addChannelNamespace('leaderboard', {
      authorizationConfig: {
        publishAuthModeTypes: [
          AppSyncAuthorizationType.API_KEY
        ]
      },
    });
  }
}