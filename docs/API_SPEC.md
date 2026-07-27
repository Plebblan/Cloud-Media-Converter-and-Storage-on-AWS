# API Specification

## Endpoints

### `POST /presigned-url`
Request a presigned URL for direct S3 upload.

Request:

```json
{
  "fileName": "example.mp4",
  "userId": "user-123",
  "targetFormat": "mp4"
}
```

Response:

```json
{
  "jobId": "generated-job-id",
  "uploadUrl": "https://...",
  "key": "raw/user-123/generated-job-id/example.mp4"
}
```

### `GET /job-status/{userId}/{jobId}`
Poll job status and metadata for media processing.
