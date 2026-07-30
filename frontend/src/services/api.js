import { uploadToS3 as uploadFileToS3 } from './s3-upload';

const buildUrl = (path) => {
  // Guarantees path starts with a single leading slash
  return path.startsWith('/') ? path : `/${path}`;
};

async function requestJson(path, options = {}) {
  const response = await fetch(buildUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

export async function requestPresignedUrl({ fileName, targetFormat = 'mp4' }) {
  return requestJson('/api/presigned-url', {
    method: 'POST',
    body: JSON.stringify({ fileName, targetFormat }),
  });
}

export async function createUploadJob(file, targetFormat = 'mp4') {
  return requestPresignedUrl({
    fileName: file?.name || 'upload',
    targetFormat,
  });
}

export async function uploadToS3(url, file) {
  return uploadFileToS3(file, url);
}

export async function waitForJobCompletion(jobId, options = {}) {
  const { interval = 3000, onStatusChange } = options;

  return new Promise((resolve, reject) => {
    let cancelled = false;

    const poll = async () => {
      try {
        const response = await getJobStatus(jobId);
        const job = response.job || response;

        if (!cancelled && onStatusChange) {
          onStatusChange(job);
        }

        const normalizedStatus = String(job?.status || '').toUpperCase();

        if (
          ['COMPLETED', 'COMPLETE', 'SUCCEEDED', 'DONE'].includes(normalizedStatus)
        ) {
          resolve(job);
          return;
        }

        if (
          ['FAILED', 'ERROR', 'CANCELLED', 'CANCELED'].includes(normalizedStatus)
        ) {
          reject(new Error(job?.error || job?.errorMessage || 'The conversion failed.'));
          return;
        }

        if (!cancelled) {
          setTimeout(poll, interval);
        }
      } catch (error) {
        if (!cancelled) {
          reject(error);
        }
      }
    };

    void poll();

    return () => {
      cancelled = true;
    };
  });
}

export async function getDownloadUrl(job) {
  return job?.downloadUrl || job?.outputUrl || job?.convertedFileUrl || job?.downloadURL || null;
}

export async function getJobStatus(jobId) {
  return requestJson(`/api/job-status/${encodeURIComponent(jobId)}`);
}