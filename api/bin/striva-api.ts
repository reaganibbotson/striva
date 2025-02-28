#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { StrivaAPIStack } from '../lib/api-stack';
import { StrivaComputeStack } from '../lib/compute-stack';
import { StrivaStorageStack } from '../lib/storage-stack';

const app = new cdk.App();
const storageStack = new StrivaStorageStack(app, 'StorageStack');
const computeStack = new StrivaComputeStack(app, 'ComputeStack', storageStack);

new StrivaAPIStack(app, 'APIStack', computeStack);