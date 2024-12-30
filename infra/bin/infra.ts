#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { APIStack } from '../lib/api-stack';
import { ComputeStack } from '../lib/compute-stack';

const app = new cdk.App();
const computeStack = new ComputeStack(app, 'ComputeStack');

new APIStack(app, 'APIStack', computeStack);