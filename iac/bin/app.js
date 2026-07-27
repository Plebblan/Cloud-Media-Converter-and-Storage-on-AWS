#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const { ServerlessBackendStack } = require('../lib/serverless-backend-stack');

const app = new cdk.App();

new ServerlessBackendStack(app, 'CloudMediaConverterServerlessStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'ap-southeast-1',
  },
});
