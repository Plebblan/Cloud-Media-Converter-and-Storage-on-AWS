#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const { ServerlessBackendStack } = require('../lib/serverless-backend-stack');
const { FrontendStack } = require('../lib/frontend-stack');

const app = new cdk.App();

const backend = new ServerlessBackendStack(app, 'CloudMediaConverterServerlessStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'ap-southeast-1',
  },
});

const frontend = new FrontendStack(app, 'CloudMediaConverterFrontend',{
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'ap-southeast-1',
  },
  apiGateway: backend.api,
});