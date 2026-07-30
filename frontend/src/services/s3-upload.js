export async function uploadToS3(file, url) {
  const response = await fetch(url, {
    method: 'PUT',
    body: file,
  });

  if (!response.ok) {
    throw new Error(`S3 upload failed with status ${response.status}`);
  }

  return true;
}
