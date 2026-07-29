const path = require('path');
const cdk = require('aws-cdk-lib');
const apigateway = require('aws-cdk-lib/aws-apigateway');
const dynamodb = require('aws-cdk-lib/aws-dynamodb');
const lambda = require('aws-cdk-lib/aws-lambda');
const lambdaNodejs = require('aws-cdk-lib/aws-lambda-nodejs');
const s3 = require('aws-cdk-lib/aws-s3');
const s3n = require('aws-cdk-lib/aws-s3-notifications');
const { Construct } = require('constructs');

class ServerlessBackendStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const rawBucket = new s3.Bucket(this, 'RawMediaBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors: [{
        allowedMethods: [s3.HttpMethods.PUT],
        allowedOrigins: ['*'],
        allowedHeaders: ['*'],
      }],
    });

    const processedBucket = new s3.Bucket(this, 'ProcessedMediaBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const jobsTable = new dynamodb.Table(this, 'JobsTable', {
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const commonEnvironment = {
      RAW_BUCKET_NAME: rawBucket.bucketName,
      PROCESSED_BUCKET_NAME: processedBucket.bucketName,
      JOBS_TABLE_NAME: jobsTable.tableName,
      DEFAULT_TARGET_FORMAT: 'mp4',
    };

    const getPresignedUrl = this.createNodeFunction('GetPresignedUrlFunction', 'get-presigned-url', commonEnvironment);
    const getJobStatus = this.createNodeFunction('GetJobStatusFunction', 'get-job-status', commonEnvironment);
    const processUpload = this.createNodeFunction('ProcessUploadFunction', 'process-upload', commonEnvironment, {
      memorySize: 1024,
      timeout: cdk.Duration.minutes(15),
      ephemeralStorageSize: cdk.Size.mebibytes(2048),
      bundling: {
        externalModules: ['ffmpeg-static'],
        nodeModules: ['ffmpeg-static'],
        environment: {
          npm_config_platform: 'linux',
          npm_config_arch: 'arm64',
        },
      },
    });

    rawBucket.grantPut(getPresignedUrl);
    jobsTable.grantWriteData(getPresignedUrl);

    jobsTable.grantReadData(getJobStatus);

    rawBucket.grantRead(processUpload);
    processedBucket.grantReadWrite(processUpload);
    jobsTable.grantReadWriteData(processUpload);

    rawBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(processUpload),
      { prefix: 'raw/' },
    );

    const api = new apigateway.RestApi(this, 'CloudMediaApi', {
      restApiName: 'cloud-media-converter-api',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    api.root
      .addResource('presigned-url')
      .addMethod('POST', new apigateway.LambdaIntegration(getPresignedUrl));

    api.root
      .addResource('job-status')
      .addResource('{userId}')
      .addResource('{jobId}')
      .addMethod('GET', new apigateway.LambdaIntegration(getJobStatus));

    new cdk.CfnOutput(this, 'ApiUrl', { value: api.url });
    new cdk.CfnOutput(this, 'RawBucketName', { value: rawBucket.bucketName });
    new cdk.CfnOutput(this, 'ProcessedBucketName', { value: processedBucket.bucketName });
    new cdk.CfnOutput(this, 'JobsTableName', { value: jobsTable.tableName });
  }

  createNodeFunction(id, functionName, environment, overrides = {}) {
    const { bundling, ...functionOverrides } = overrides;

    return new lambdaNodejs.NodejsFunction(this, id, {
      entry: path.join(__dirname, '..', '..', 'backend', 'src', 'functions', functionName, 'index.js'),
      depsLockFilePath: path.join(__dirname, '..', '..', 'backend', 'package-lock.json'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_24_X,
      architecture: lambda.Architecture.ARM_64,
      memorySize: 256,
      timeout: cdk.Duration.seconds(30),
      environment,
      bundling: {
        externalModules: [],
        minify: true,
        sourceMap: false,
        ...bundling,
      },
      ...functionOverrides,
    });
  }
}

module.exports = {
  ServerlessBackendStack,
};
