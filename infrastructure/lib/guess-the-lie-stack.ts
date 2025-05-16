import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';

export class GuessTheLieStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a DynamoDB table to store facts and lies
    const factsTable = new dynamodb.Table(this, 'FactsTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For development only
    });

    // Add a GSI for querying by person name
    factsTable.addGlobalSecondaryIndex({
      indexName: 'PersonIndex',
      partitionKey: { name: 'person', type: dynamodb.AttributeType.STRING },
    });

    // Create the Lambda function for getting data
    const getDataFunction = new lambda.Function(this, 'GetDataFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'get-data.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      environment: {
        TABLE_NAME: factsTable.tableName,
      },
    });

    // Create the Lambda function for guessing
    const guessFunction = new lambda.Function(this, 'GuessFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'guess.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      environment: {
        TABLE_NAME: factsTable.tableName,
      },
    });

    // Grant permissions to the Lambda functions
    factsTable.grantReadData(getDataFunction);
    factsTable.grantReadData(guessFunction);

    // Create the API Gateway
    const api = new apigateway.RestApi(this, 'GuessTheLieApi', {
      restApiName: 'Guess The Lie API',
      description: 'API for the Guess The Lie game',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    // Add the get-data endpoint
    const getDataIntegration = new apigateway.LambdaIntegration(getDataFunction);
    api.root.addResource('get-data').addMethod('GET', getDataIntegration);

    // Add the guess endpoint
    const guessIntegration = new apigateway.LambdaIntegration(guessFunction);
    api.root.addResource('guess').addMethod('POST', guessIntegration);

    // Output the API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'The URL of the API Gateway',
    });
  }
}