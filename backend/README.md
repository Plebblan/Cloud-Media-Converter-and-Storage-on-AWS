# Cloud Media Converter - Serverless Backend

This backend contains AWS Lambda handlers intended to be deployed by the CDK app in `iac/`.

## Runtime Shape

- API Gateway exposes upload/job endpoints.
- Lambda generates S3 presigned upload URLs.
- Clients upload media directly to S3.
- S3 object-created events invoke a processing Lambda.
- DynamoDB stores job metadata and status.

## Handlers

- `src/functions/get-presigned-url` - creates a job record and returns a presigned S3 upload URL.
- `src/functions/get-job-status` - reads job status from DynamoDB.
- `src/functions/process-upload` - reacts to uploaded objects, runs FFmpeg in Lambda, uploads the converted file, and updates job status.

## FFmpeg

The conversion Lambda expects an FFmpeg binary at `/opt/bin/ffmpeg`. Attach a compatible Lambda layer during deploy:

```bash
cd iac
npm run deploy -- -c ffmpegLayerArn=arn:aws:lambda:REGION:ACCOUNT_ID:layer:LAYER_NAME:VERSION
```

Lambda conversion is best for small and medium files that fit within the function timeout and `/tmp` storage. Larger media jobs should move to ECS/Fargate or AWS Batch while keeping the same S3/DynamoDB API shape.

## Deploy

Install backend dependencies, then deploy from the CDK project:

```bash
cd backend
npm install

cd ../iac
npm install
npm run deploy
```
