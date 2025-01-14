import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { StrivaComputeStack } from './compute-stack';

export class StrivaAPIStack extends cdk.Stack {
  constructor(scope: Construct, id: string, computeStack: StrivaComputeStack, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new apigateway.RestApi(this, 'striva-api', {
      restApiName: 'Striva API',
    });

    // Use the compute stack to create the Lambda functions
    const authResource = api.root.addResource('auth');

    const exchangeTokenRoute = authResource.addResource('exchange-token');
    const exchangeTokenIntegration = new apigateway.LambdaIntegration(computeStack.exchangeTokenLambda);
    exchangeTokenRoute.addMethod('POST', exchangeTokenIntegration);

    const refreshTokenRoute = authResource.addResource('refresh-token');
    const refreshTokenIntegration = new apigateway.LambdaIntegration(computeStack.refreshTokenLambda);
    refreshTokenRoute.addMethod('POST', refreshTokenIntegration);

    // Add CORS support
    api.addGatewayResponse('Default4xx', {
      type: apigateway.ResponseType.DEFAULT_4XX,
      responseHeaders: {
        'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
        'gatewayresponse.header.Access-Control-Allow-Headers': "'*'",
        'gatewayresponse.header.Access-Control-Allow-Methods': "'*'",
      },
    });

    // Add the CORS preflight OPTIONS method to the API
    api.root.addMethod('OPTIONS');

    // Output the API URL
    new cdk.CfnOutput(this, 'StravaAPI', {
      value: api.url || 'Something went wrong with the deployment',
    });
  }
}
