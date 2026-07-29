# Cloud Media Converter - Serverless Backend

This backend contains the AWS Lambda handlers that power the media conversion workflow. The handlers are deployed by the CDK app in the `iac/` directory.

## Runtime shape

- API Gateway exposes the upload and job-status endpoints.
- Lambda generates S3 presigned upload URLs.
- Clients upload media directly to S3.
- S3 object-created events invoke the processing Lambda.
- DynamoDB stores job metadata and status.

## Local setup

1. Install backend dependencies:

```bash
cd backend
npm install
```

## Infrastructure deployment

From the repository root:

```bash
cd iac
npm install
npm run synth
npm run deploy
```

The CDK stack will create the required AWS resources and update the backend environment file with the generated values.

## Cleanup

To destroy the deployed AWS resources:

```bash
cd iac
npm run cleanup
```
