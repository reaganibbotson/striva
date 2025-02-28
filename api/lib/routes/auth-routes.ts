import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { StrivaComputeStack } from '../compute-stack';

export interface RouteDefinition {
  path: string;
  method: string;
  integration: apigateway.LambdaIntegration;
  options?: {
    requestValidator?: apigateway.RequestValidator;
    requestModels?: { [contentType: string]: apigateway.Model };
    methodResponses?: apigateway.MethodResponse[];
  };
}

const defaultMethodResponses = [
  {
    statusCode: '200',
    responseModels: {
      'application/json': apigateway.Model.EMPTY_MODEL,
    },
  },
  {
    statusCode: '400',
    responseModels: {
      'application/json': apigateway.Model.ERROR_MODEL,
    },
  },
  {
    statusCode: '500',
    responseModels: {
      'application/json': apigateway.Model.ERROR_MODEL,
    },
  },
];

export const createAuthRoutes = (computeStack: StrivaComputeStack): RouteDefinition[] => {
  return [
    {
      path: 'exchange-token',
      method: 'POST',
      integration: new apigateway.LambdaIntegration(computeStack.exchangeTokenLambda),
      options: {
        methodResponses: [
          ...defaultMethodResponses,
        ],
      },
    },
    {
      path: 'refresh-token',
      method: 'POST',
      integration: new apigateway.LambdaIntegration(computeStack.refreshTokenLambda),
      options: {
        methodResponses: [
            ...defaultMethodResponses,
          ],
      },
    },
  ];
}; 