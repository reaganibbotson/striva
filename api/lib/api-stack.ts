import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { StrivaComputeStack } from './compute-stack';
import { RouteBuilder } from './utils/route-builder';
import { createAuthRoutes } from './routes/auth-routes';

export class StrivaAPIStack extends cdk.Stack {
  constructor(scope: Construct, id: string, computeStack: StrivaComputeStack, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create the API Gateway
    const api = new apigateway.RestApi(this, 'striva-api', {
      restApiName: 'Striva API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
          'X-Amz-User-Agent',
        ],
      },
    });

    // Create route builder
    const routeBuilder = new RouteBuilder(api);

    // Add authentication routes
    routeBuilder.addRoutes('auth', createAuthRoutes(computeStack));

    // Add default 4XX response
    api.addGatewayResponse('Default4xx', {
      type: apigateway.ResponseType.DEFAULT_4XX,
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'",
        'Access-Control-Allow-Headers': "'*'",
        'Access-Control-Allow-Methods': "'*'",
      },
    });

    // Output the API URL
    new cdk.CfnOutput(this, 'StravaAPI', {
      value: api.url,
      description: 'API Gateway endpoint URL',
    });
  }
}
