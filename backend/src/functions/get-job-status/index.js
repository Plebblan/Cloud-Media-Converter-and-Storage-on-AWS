const { GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { unmarshall } = require('@aws-sdk/util-dynamodb');
const { dynamodb } = require('../../shared/dynamodb-client');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Client = new S3Client({});
const PROCESSED_BUCKET_NAME = process.env.PROCESSED_BUCKET_NAME;

const DB_TABLE_NAME = process.env.JOBS_TABLE_NAME;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  try {
    const { jobId } = event.pathParameters || {};

    if (!jobId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'jobId is required' }),
      };
    }

    const response = await dynamodb.send(new GetItemCommand({
      TableName: DB_TABLE_NAME,
      Key: {
        PK: { S: `JOB#${jobId}` },
      },
    }));

    if (!response.Item) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Job not found' }),
      };
    }

    const rawJob = unmarshall(response.Item);
    const normalizedStatus = String(rawJob.status || '').toUpperCase();
    const job = {
      jobId: rawJob.jobId,
      targetFormat: rawJob.targetFormat,
      status: rawJob.status,
      createdAt: rawJob.createdAt,
      completedAt: rawJob.completedAt,
      outputS3Key: rawJob.outputS3Key,
      error: rawJob.error || rawJob.errorMessage || null,
    };

    if (
      ['COMPLETED', 'COMPLETE', 'SUCCEEDED', 'DONE'].includes(normalizedStatus) &&
      rawJob.outputS3Key
    ) {
      const command = new GetObjectCommand({
        Bucket: PROCESSED_BUCKET_NAME,
        Key: rawJob.outputS3Key,
      });

      // Generate a URL valid for 1 hour (3600 seconds)
      job.downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ job }),
    };
  } catch (error) {
    console.error('Error reading job status:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Failed to read job status' }),
    };
  }
};
