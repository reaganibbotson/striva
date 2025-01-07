#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { StrivaAPIStack } from '../lib/api-stack';
import { StrivaComputeStack } from '../lib/compute-stack';

const app = new cdk.App();
const computeStack = new StrivaComputeStack(app, 'ComputeStack');

new StrivaAPIStack(app, 'APIStack', computeStack);