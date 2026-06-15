import { Construct } from 'constructs';
import { RemovalPolicy } from 'aws-cdk-lib';
import { AttributeType, Billing, TableV2, StreamViewType, ProjectionType } from 'aws-cdk-lib/aws-dynamodb';

export class DynamoDBConstruct extends Construct {
  public readonly gamesTable: TableV2;
  public readonly leaderboardTable: TableV2; 
  constructor(scope: Construct, id: string, props: { environment: string }) {
    super(scope, id);

    this.gamesTable = new TableV2(this, `mastermind-game-table-${props.environment}`, {
      tableName: `MastermindGameTable-${props.environment}`,
      partitionKey: { name: 'gameId', type: AttributeType.STRING },
      sortKey: { name: 'userId', type: AttributeType.STRING },
      billing: Billing.onDemand(),
      timeToLiveAttribute: 'ttl',
      removalPolicy: RemovalPolicy.DESTROY,
      dynamoStream: StreamViewType.NEW_AND_OLD_IMAGES,
      globalSecondaryIndexes: [
        {
          indexName: 'UserGamesIndex',
          partitionKey: { name: 'userId', type: AttributeType.STRING },
          sortKey: { name: 'startedAt', type: AttributeType.STRING },
          projectionType: ProjectionType.ALL,
        }
      ]
    });

    this.leaderboardTable = new TableV2(this, `mastermind-leaderboard-table-${props.environment}`, {
      tableName: `MastermindLeaderboardTable-${props.environment}`,
      partitionKey: { name: 'userId', type: AttributeType.STRING },
      sortKey: { name: 'difficulty', type: AttributeType.STRING },
      billing: Billing.onDemand(),
      removalPolicy: RemovalPolicy.DESTROY
    });
  }
}