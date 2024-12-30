import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export class ComputeStack extends cdk.Stack {
    public readonly exchangeTokenLambda: lambda.Function;
    public readonly refreshTokenLambda: lambda.Function;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Retrieve environment variables from Parameter Store
        const stravaClientId = ssm.StringParameter.valueForStringParameter(this, 'STRAVA_CLIENT_ID');
        const stravaClientSecret = ssm.StringParameter.valueForStringParameter(this, 'STRAVA_CLIENT_SECRET');

        // Define the environment variables
        const standardEnvVars = {
            STRAVA_CLIENT_ID: stravaClientId,
            STRAVA_CLIENT_SECRET: stravaClientSecret,
        };

        // Define the path to the packaged Lambda function code
        const baseHandlerPath = path.join(__dirname, '../', '../', 'api', 'src', 'handlers');

        // Create the exchangeTokenLambda function
        this.exchangeTokenLambda = new lambda.Function(this, 'exchangeTokenLambda', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'auth/exchangeToken.handler',
            code: lambda.Code.fromAsset(baseHandlerPath),
            environment: standardEnvVars,
        });

        // Create the refreshTokenLambda function
        this.refreshTokenLambda = new lambda.Function(this, 'refreshTokenLambda', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'auth/refreshToken.handler',
            code: lambda.Code.fromAsset(baseHandlerPath),
            environment: standardEnvVars,
        });
    }
}