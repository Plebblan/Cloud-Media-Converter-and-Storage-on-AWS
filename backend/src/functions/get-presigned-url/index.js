const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall } = require('@aws-sdk/util-dynamodb');
const { randomUUID } = require('crypto');

const s3 = new S3Client({ region: process.env.AWS_REGION });
const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION });

const RAW_BUCKET_NAME = process.env.RAW_BUCKET_NAME;
const DB_TABLE_NAME = process.env.JOBS_TABLE_NAME;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { fileName, userId, targetFormat = 'mp4' } = body;

    if (!fileName || !userId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'fileName and userId are required' }),
      };
    }

    const jobId = randomUUID();
    const s3Key = `raw/${userId}/${jobId}/${fileName}`;

    // 1. Log job status in DynamoDB
    const dbParams = {
      TableName: DB_TABLE_NAME,
      Item: marshall({
        PK: `USER#${userId}`,
        SK: `JOB#${jobId}`,
        jobId: jobId,
        status: 'PENDING_UPLOAD',
        originalFileName: fileName,
        targetFormat,
        inputS3Key: s3Key,
        createdAt: new Date().toISOString(),
      }),
    };
    await dynamodb.send(new PutItemCommand(dbParams));

    // 2. Generate S3 Presigned URL (Valid for 15 mins)
    const command = new PutObjectCommand({
      Bucket: RAW_BUCKET_NAME,
      Key: s3Key,
    });
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 900 });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        jobId,
        uploadUrl: presignedUrl,
        key: s3Key,
      }),
    };
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Failed to create upload target' }),
    };
  }
};
