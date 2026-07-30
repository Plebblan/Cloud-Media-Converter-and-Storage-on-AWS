const fs = require('fs');
const os = require('os');
const path = require('path');
const { pipeline } = require('stream/promises');
const { spawn } = require('child_process');
const { GetObjectCommand, PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const { dynamodb } = require('../../shared/dynamodb-client');
const logger = require('../../shared/logger');
const FFMPEG_PATH = require('ffmpeg-static');
const { GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const s3 = new S3Client({ region: process.env.AWS_REGION });

const FFMPEG_TIMEOUT_MS = 5 * 60 * 1000;

const DB_TABLE_NAME = process.env.JOBS_TABLE_NAME;
const PROCESSED_BUCKET_NAME = process.env.PROCESSED_BUCKET_NAME;
const DEFAULT_TARGET_FORMAT = process.env.DEFAULT_TARGET_FORMAT || 'mp4';

const contentTypes = {
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  aac: 'audio/aac',
};

function parseJobFromKey(key) {
  const decodedKey = decodeURIComponent(key.replace(/\+/g, ' '));
  const match = decodedKey.match(/^raw\/([^/]+)\/(.+)$/);

  if (!match) {
    return null;
  }

  return {
    jobId: match[1],
    originalFileName: match[2],
    inputS3Key: decodedKey,
  };
}

async function getJob(parsed) {
  const response = await dynamodb.send(new GetCommand({
    TableName: DB_TABLE_NAME,
    Key: {
      PK: `JOB#${parsed.jobId}`,
    },
  }));

  return response.Item || {};
}

async function updateJob(parsed, values) {
  const names = {};
  const attributeValues = {};
  const assignments = [];

  // Alias ALL keys dynamically to prevent collisions with reserved keywords (e.g., ttl, status)
  for (const [key, value] of Object.entries(values)) {
    const nameKey = `#${key}`;
    const valueKey = `:${key}`;

    names[nameKey] = key;
    assignments.push(`${nameKey} = ${valueKey}`);
    attributeValues[valueKey] = value;
  }

  const response = await dynamodb.send(new UpdateCommand({
    TableName: DB_TABLE_NAME,
    Key: {
      PK: `JOB#${parsed.jobId}`,
    },
    UpdateExpression: `SET ${assignments.join(', ')}`,
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: attributeValues,
    ReturnValues: 'ALL_NEW',
  }));

  return response.Attributes || {};
}

async function downloadObject(bucketName, objectKey, destinationPath) {
  const response = await s3.send(new GetObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
  }));

  await pipeline(response.Body, fs.createWriteStream(destinationPath));
}

function getFormatArgs(targetFormat) {
  switch (targetFormat) {
    case 'mp4':
      return ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart'];
 
    case 'webm':
      // VP9 + Opus is the modern, well-supported webm pairing.
      // -deadline good balances speed/quality (realtime is faster but worse quality).
      // -b:v 0 tells libvpx-vp9 to use constant-quality mode driven by -crf.
      return ['-c:v', 'libvpx-vp9', '-crf', '32', '-b:v', '0', '-deadline', 'good', '-cpu-used', '5', '-c:a', 'libopus', '-b:a', '128k'];
 
    case 'mov':
      // ProRes-in-mov is the more "correct" choice for .mov (Apple ecosystem,
      // editing-friendly), h264 is fine too if smaller files matter more.
      // Sticking with h264 here for parity with mp4 unless you specifically want ProRes.
      return ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-c:a', 'aac', '-b:a', '192k'];
 
    case 'mp3':
      return ['-vn', '-c:a', 'libmp3lame', '-q:a', '2']; // ~190kbps VBR, good quality/size tradeoff
 
    case 'wav':
      return ['-vn', '-c:a', 'pcm_s16le']; // standard uncompressed WAV
 
    case 'aac':
      return ['-vn', '-c:a', 'aac', '-b:a', '192k'];
 
    case 'jpg':
    case 'jpeg':
      return ['-frames:v', '1', '-q:v', '3']; // -q:v 2-5 is visually near-lossless; 1=best, 31=worst
      // Note: many odd-dimension source images are fine for jpg/png (only libx264-style
      // video encoders require even width/height), so this is safer for images generally.
 
    case 'png':
      return ['-frames:v', '1']; // PNG is lossless by nature, no quality flag needed
 
    case 'webp':
      return ['-frames:v', '1', '-quality', '85'];
 
    default:
      return []; // let ffmpeg pick defaults for anything unlisted
  }
}
 
function runFfmpeg(inputPath, outputPath, targetFormat) {
  const args = [
    '-y',
    '-i', inputPath,
    ...getFormatArgs(targetFormat),
    outputPath,
  ];
 
  return new Promise((resolve, reject) => {
    const child = spawn(FFMPEG_PATH, args);
    let stderr = '';
    let settled = false;
 
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill('SIGKILL');
      reject(new Error(`ffmpeg timed out after ${FFMPEG_TIMEOUT_MS / 1000}s (target=${targetFormat})`));
    }, FFMPEG_TIMEOUT_MS);
 
    // IMPORTANT: drain stdout even though we don't need its contents.
    // Without this, ffmpeg can block on a full stdout pipe and never emit 'close'.
    child.stdout.on('data', () => {});
 
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
 
    child.on('error', (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(err);
    });
 
    child.on('close', (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
 
      if (code === 0) {
        resolve();
        return;
      }
 
      reject(new Error(`ffmpeg exited with code ${code} (target=${targetFormat}): ${stderr.slice(-2000)}`));
    });
  });
}

async function uploadOutput(outputPath, outputKey, targetFormat) {
  await s3.send(new PutObjectCommand({
    Bucket: PROCESSED_BUCKET_NAME,
    Key: outputKey,
    Body: fs.createReadStream(outputPath),
    ContentType: contentTypes[targetFormat] || 'application/octet-stream',
  }));
}

exports.handler = async (event) => {
  const results = [];

  for (const record of event.Records || []) {
    const bucketName = record.s3.bucket.name;
    const objectKey = record.s3.object.key;
    const parsed = parseJobFromKey(objectKey);

    if (!parsed) {
      logger.log('Skipping object with unsupported key shape', { bucketName, objectKey });
      continue;
    }

    const ttlInSeconds = Math.floor(Date.now() / 1000) + (3 * 60 * 60); // time-to-live of 3 hours
    let inputPath = null;
    let outputPath = null;

    try {
      const job = await getJob(parsed);
      const targetFormat = String(job.targetFormat || DEFAULT_TARGET_FORMAT).replace(/^\./, '').toLowerCase();
      inputPath = path.join(os.tmpdir(), `input-${parsed.jobId}-${path.basename(parsed.originalFileName)}`);
      const outputFileName = `${path.parse(parsed.originalFileName).name}.${targetFormat}`;
      outputPath = path.join(os.tmpdir(), `output-${parsed.jobId}-${outputFileName}`);
      const outputS3Key = `processed/${parsed.jobId}/${outputFileName}`;

      await updateJob(parsed, {
        status: 'PROCESSING',
        uploadedAt: new Date().toISOString(),
        rawBucketName: bucketName,
        inputS3Key: parsed.inputS3Key,
        ttl: ttlInSeconds
      });

      await downloadObject(bucketName, parsed.inputS3Key, inputPath);
      await runFfmpeg(inputPath, outputPath, targetFormat);
      await uploadOutput(outputPath, outputS3Key, targetFormat);

      const completedJob = await updateJob(parsed, {
        status: 'COMPLETED',
        completedAt: new Date().toISOString(),
        outputBucketName: PROCESSED_BUCKET_NAME,
        outputS3Key,
        ttl: ttlInSeconds,
      });

      results.push(completedJob);
    } catch (error) {
      logger.log('Lambda conversion failed', { error: error.message, jobId: parsed.jobId });

      try {
        const failedJob = await updateJob(parsed, {
          status: 'FAILED',
          failedAt: new Date().toISOString(),
          errorMessage: error.message,
          ttl: ttlInSeconds,
        });

        results.push(failedJob);
      } catch (dbError) {
        logger.log('Failed to record failure status in DynamoDB', { error: dbError.message });
      }
    } finally {
      // Clean up temp files safely
      [inputPath, outputPath].forEach((filePath) => {
        if (filePath && fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (e) {
            // Ignore deletion errors
          }
        }
      });
    }
  }

  return {
    processed: results.length,
    jobs: results,
  };
};
