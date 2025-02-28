import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { StrivaStorageStack } from './storage-stack';

export class StrivaComputeStack extends cdk.Stack {
    public readonly exchangeTokenLambda: lambda.Function;
    public readonly refreshTokenLambda: lambda.Function;

    constructor(scope: Construct, id: string, storageStack: StrivaStorageStack, props?: cdk.StackProps) {
        super(scope, id, props);

        // Retrieve environment variables from Parameter Store
        const stravaClientId = ssm.StringParameter.valueForStringParameter(this, 'STRAVA_CLIENT_ID');
        const stravaClientSecret = ssm.StringParameter.valueForStringParameter(this, 'STRAVA_CLIENT_SECRET');

        // Define the environment variables
        const standardEnvVars = {
            STRAVA_CLIENT_ID: stravaClientId,
            STRAVA_CLIENT_SECRET: stravaClientSecret,
        };

        const lambdaPath = path.join(__dirname, '../lambda/');

        // Common bundling options for all functions
        const bundlingOptions = {
            minify: true,
            sourceMap: true,
            target: 'node18',
            loader: {
                '.ts': 'ts'
            },
            format: OutputFormat.CJS,
            banner: 'require("source-map-support").install();',
            forceDockerBundling: false // This disables Docker bundling
        };

        // Define the path to the packaged Lambda function code
        this.exchangeTokenLambda = new NodejsFunction(this, 'exchangeTokenLambda', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'handler',
            entry: path.join(lambdaPath, 'auth/exchangeToken.ts'),
            environment: standardEnvVars,
            bundling: bundlingOptions
        });

        // Create the refreshTokenLambda function
        this.refreshTokenLambda = new NodejsFunction(this, 'refreshTokenLambda', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'handler',
            entry: path.join(lambdaPath, 'auth/refreshToken.ts'),
            environment: standardEnvVars,
            bundling: bundlingOptions
        });
    }
}