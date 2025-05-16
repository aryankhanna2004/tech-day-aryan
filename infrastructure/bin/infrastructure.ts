#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { GuessTheLieStack } from '../lib/guess-the-lie-stack';

const app = new cdk.App();
new GuessTheLieStack(app, 'GuessTheLieStack', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: 'us-west-2' // Match the region in the .env file
  },
});