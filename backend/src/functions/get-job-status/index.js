const { GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { unmarshall } = require('@aws-sdk/util-dynamodb');
const { dynamodb } = require('../../shared/dynamodb-client');

const DB_TABLE_NAME = process.env.JOBS_TABLE_NAME;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  try {
    const { userId, jobId } = event.pathParameters || {};

    if (!userId || !jobId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'userId and jobId are required' }),
      };
    }

    const response = await dynamodb.send(new GetItemCommand({
      TableName: DB_TABLE_NAME,
      Key: {
        PK: { S: `USER#${userId}` },
        SK: { S: `JOB#${jobId}` },
      },
    }));

    if (!response.Item) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Job not found' }),
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ job: unmarshall(response.Item) }),
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
