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

export async function requestPresignedUrl({ fileName, userId, targetFormat = 'mp4' }) {
  return requestJson('/api/presigned-url', {
    method: 'POST',
    body: JSON.stringify({ fileName, userId, targetFormat }),
  });
}

export async function getJobStatus(userId, jobId) {
  return requestJson(`/api/job-status/${encodeURIComponent(userId)}/${encodeURIComponent(jobId)}`);
}