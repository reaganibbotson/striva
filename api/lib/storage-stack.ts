import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export class StrivaStorageStack extends cdk.Stack {
    public readonly dbInstance: rds.DatabaseInstance;
    public readonly vpc: ec2.Vpc;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Create a VPC
        this.vpc = new ec2.Vpc(this, 'VPC', {
            maxAzs: 2,
            natGateways: 0,         // Remove NAT Gateway if you don't need internet access from private subnets
            subnetConfiguration: [
                {
                    cidrMask: 24,
                    name: 'Public',
                    subnetType: ec2.SubnetType.PUBLIC,
                },
                {
                    cidrMask: 24,
                    name: 'Private',
                    subnetType: ec2.SubnetType.PRIVATE_ISOLATED,  // Use ISOLATED instead of PRIVATE if you don't need NAT
                }
            ]
        });

        // Create a security group for the RDS instance
        const dbSecurityGroup = new ec2.SecurityGroup(this, 'DBSecurityGroup', {
            vpc: this.vpc,
            description: 'Security group for RDS instance',
            allowAllOutbound: true,
        });

        // Allow inbound PostgreSQL traffic from anywhere (you might want to restrict this in production)
        dbSecurityGroup.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(5432),
            'Allow PostgreSQL access from anywhere'
        );

        // Create the RDS instance
        this.dbInstance = new rds.DatabaseInstance(this, 'Instance', {
            engine: rds.DatabaseInstanceEngine.postgres({
                version: rds.PostgresEngineVersion.VER_16_4
            }),
            vpc: this.vpc,
            credentials: rds.Credentials.fromGeneratedSecret('postgres'), // This will create a secret in AWS Secrets Manager
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MICRO),
            allocatedStorage: 20,
            maxAllocatedStorage: 100,
            databaseName: 'activitiesdb',
            removalPolicy: cdk.RemovalPolicy.DESTROY, // Be careful with this in production
            deletionProtection: false,
            securityGroups: [dbSecurityGroup],
            publiclyAccessible: true, // This allows connection from DBeaver
            // backupRetention: cdk.Duration.days(7), // Enable automated backups
        });

        // Store database connection information in SSM Parameter Store for easy access
        new ssm.StringParameter(this, 'DBEndpointParameter', {
            parameterName: '/striva/db/endpoint',
            stringValue: this.dbInstance.instanceEndpoint.hostname,
            description: 'Database endpoint',
        });

        new ssm.StringParameter(this, 'DBPortParameter', {
            parameterName: '/striva/db/port',
            stringValue: this.dbInstance.instanceEndpoint.port.toString(),
            description: 'Database port',
        });

        new ssm.StringParameter(this, 'DBNameParameter', {
            parameterName: '/striva/db/name',
            stringValue: 'activitiesdb',
            description: 'Database name',
        });

        // Output the database connection details
        new cdk.CfnOutput(this, 'DBEndpoint', {
            value: this.dbInstance.instanceEndpoint.hostname,
            description: 'Database endpoint',
            exportName: 'DBEndpoint',
        });

        new cdk.CfnOutput(this, 'DBPort', {
            value: this.dbInstance.instanceEndpoint.port.toString(),
            description: 'Database port',
            exportName: 'DBPort',
        });

        new cdk.CfnOutput(this, 'DBSecretName', {
            value: this.dbInstance.secret?.secretName || '',
            description: 'Secret name for database credentials',
            exportName: 'DBSecretName',
        });

        // Add a comment with instructions for connecting with DBeaver
        new cdk.CfnOutput(this, 'DBeaver-Instructions', {
            value: 'To connect with DBeaver:\n' +
                  '1. Get the credentials from AWS Secrets Manager\n' +
                  '2. Use the endpoint and port from the outputs above\n' +
                  '3. Database name is "activitiesdb"\n' +
                  '4. Make sure your IP is allowed in the security group',
            description: 'Instructions for connecting with DBeaver',
        });
    }
}
