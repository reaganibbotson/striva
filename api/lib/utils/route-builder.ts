import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { RouteDefinition } from '../routes/auth-routes';

export class RouteBuilder {
  private api: apigateway.RestApi;
  private corsEnabled: boolean;

  constructor(api: apigateway.RestApi, enableCors: boolean = true) {
    this.api = api;
    this.corsEnabled = enableCors;
  }

  public addRoutes(basePath: string, routes: RouteDefinition[]): void {
    const baseResource = this.getOrCreateResource(basePath);

    routes.forEach(route => {
      const resource = this.getOrCreateResource(route.path, baseResource);
      
      // Add the main method
      const method = resource.addMethod(
        route.method,
        route.integration,
        {
          ...route.options,
        }
      );

      // Add CORS support if enabled and OPTIONS method doesn't exist
      if (this.corsEnabled && !this.hasOptionsMethod(resource)) {
        this.addCorsOptions(resource);
      }
    });
  }

  private hasOptionsMethod(resource: apigateway.IResource): boolean {
    try {
      resource.getResource('OPTIONS');
      return true;
    } catch {
      return false;
    }
  }

  private getOrCreateResource(path: string, parent?: apigateway.IResource): apigateway.Resource {
    if (!parent) {
      parent = this.api.root;
    }

    const parts = path.split('/').filter(p => p.length > 0);
    let current = parent;

    for (const part of parts) {
      const existingResource = current.getResource(part);
      current = existingResource || current.addResource(part);
    }

    return current as apigateway.Resource;
  }

  private addCorsOptions(apiResource: apigateway.IResource) {
    apiResource.addMethod('OPTIONS', new apigateway.MockIntegration({
      integrationResponses: [{
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
          'method.response.header.Access-Control-Allow-Origin': "'*'",
          'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET,PUT,POST,DELETE'",
        },
      }],
      passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
      requestTemplates: {
        "application/json": "{\"statusCode\": 200}"
      },
    }), {
      methodResponses: [{
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Headers': true,
          'method.response.header.Access-Control-Allow-Methods': true,
          'method.response.header.Access-Control-Allow-Origin': true,
        },
      }]
    });
  }
} 