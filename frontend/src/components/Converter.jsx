import React, { useState } from 'react';
import {
  createUploadJob,
  uploadToS3,
  waitForJobCompletion,
  getDownloadUrl,
} from '../services/api';

const FORMAT_OPTIONS = [
  {
    value: 'mp4',
    label: 'MP4',
    description: 'Video',
    extensions: ['video/*'],
  },
  {
    value: 'webm',
    label: 'WebM',
    description: 'Video',
    extensions: ['video/*'],
  },
  {
    value: 'mp3',
    label: 'MP3',
    description: 'Audio',
    extensions: ['video/*', 'audio/*'],
  },
  {
    value: 'wav',
    label: 'WAV',
    description: 'Audio',
    extensions: ['video/*', 'audio/*'],
  },
  {
    value: 'jpg',
    label: 'JPG',
    description: 'Image',
    extensions: ['image/*'],
  },
  {
    value: 'png',
    label: 'PNG',
    description: 'Image',
    extensions: ['image/*'],
  },
];

export default function Converter() {
  const [file, setFile] = useState(null);
  const [targetFormat, setTargetFormat] = useState('mp4');

  const [status, setStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const [job, setJob] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);

  const [error, setError] = useState('');

  const isBusy =
    status === 'creating-job' ||
    status === 'uploading' ||
    status === 'converting';

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) {
      return;
    }

    setFile(selectedFile);
    setError('');
    setJob(null);
    setDownloadUrl(null);
    setStatus('ready');
    setStatusMessage('Ready to convert');
  };

  const handleFileInput = (event) => {
    const selectedFile = event.target.files?.[0];

    handleFileSelect(selectedFile);
  };

  const handleDrop = (event) => {
    event.preventDefault();

    const droppedFile = event.dataTransfer.files?.[0];

    handleFileSelect(droppedFile);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleConvert = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    try {
      setError('');
      setDownloadUrl(null);
      setJob(null);

      // --------------------------------------------------
      // 1. Create conversion job
      // --------------------------------------------------

      setStatus('creating-job');
      setStatusMessage('Preparing your conversion...');

      const uploadJob = await createUploadJob(
        file,
        targetFormat
      );

      setJob(uploadJob);

      // --------------------------------------------------
      // 2. Upload original file directly to S3
      // --------------------------------------------------

      setStatus('uploading');
      setStatusMessage('Uploading your file...');

      await uploadToS3(
        uploadJob.uploadUrl,
        file
      );

      // --------------------------------------------------
      // 3. Wait for Lambda conversion
      // --------------------------------------------------

      setStatus('converting');
      setStatusMessage('Converting your file...');

      const completedJob = await waitForJobCompletion(
        uploadJob.jobId,
        {
          interval: 3000,

          onStatusChange: (currentJob) => {
            setJob(currentJob);

            switch (currentJob.status) {
              case 'PENDING_UPLOAD':
                setStatusMessage('Waiting for upload...');
                break;

              case 'PROCESSING':
                setStatusMessage('Converting your file...');
                break;

              case 'COMPLETED':
                setStatusMessage('Conversion complete!');
                break;

              default:
                setStatusMessage(
                  `Status: ${currentJob.status}`
                );
            }
          },
        }
      );

      // --------------------------------------------------
      // 4. Get dynamic download URL
      // --------------------------------------------------

      setJob(completedJob);

      const url = await getDownloadUrl(completedJob);

      setDownloadUrl(url);

      setStatus('completed');
      setStatusMessage('Your file is ready to download.');
    } catch (err) {
      console.error('Conversion failed:', err);

      setStatus('error');

      setError(
        err?.message ||
          'Something went wrong during conversion.'
      );

      setStatusMessage('Conversion failed.');
    }
  };

  const handleDownload = () => {
    if (!downloadUrl) {
      return;
    }

    const link = document.createElement('a');

    link.href = downloadUrl;
    link.download = `converted.${targetFormat}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setFile(null);
    setTargetFormat('mp4');
    setStatus('idle');
    setStatusMessage('');
    setJob(null);
    setDownloadUrl(null);
    setError('');
  };

  return (
    <div className="converter">
      <div className="converter-card">

        {/* Header */}
        <div className="converter-header">
          <h1>Convert your files</h1>

          <p>
            Easily convert your media files online.
          </p>
        </div>

        {/* Upload */}
        {!file && (
          <label
            className="upload-area"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              type="file"
              onChange={handleFileInput}
              hidden
            />

            <div className="upload-icon">
              ↑
            </div>

            <div className="upload-title">
              Choose a file
            </div>

            <div className="upload-description">
              or drag and drop your file here
            </div>
          </label>
        )}

        {/* Selected File */}
        {file && (
          <div className="selected-file">

            <div className="selected-file-info">
              <div className="file-icon">
                📄
              </div>

              <div>
                <div className="file-name">
                  {file.name}
                </div>

                <div className="file-size">
                  {formatFileSize(file.size)}
                </div>
              </div>
            </div>

            {!isBusy && status !== 'completed' && (
              <button
                type="button"
                className="remove-file"
                onClick={handleReset}
              >
                ×
              </button>
            )}

          </div>
        )}

        {/* Format Selection */}
        {file && status !== 'completed' && (
          <div className="format-section">

            <label className="section-label">
              Convert to
            </label>

            <div className="format-grid">
              {FORMAT_OPTIONS.map((format) => (
                <button
                  key={format.value}
                  type="button"
                  className={
                    targetFormat === format.value
                      ? 'format-option active'
                      : 'format-option'
                  }
                  onClick={() =>
                    setTargetFormat(format.value)
                  }
                  disabled={isBusy}
                >
                  <strong>
                    {format.label}
                  </strong>

                  <span>
                    {format.description}
                  </span>
                </button>
              ))}
            </div>

          </div>
        )}

        {/* Status */}
        {status !== 'idle' && (
          <div
            className={
              status === 'error'
                ? 'status-box error'
                : status === 'completed'
                  ? 'status-box success'
                  : 'status-box'
            }
          >
            {isBusy && (
              <div className="spinner" />
            )}

            {status === 'completed' && (
              <div className="status-icon">
                ✓
              </div>
            )}

            {status === 'error' && (
              <div className="status-icon">
                !
              </div>
            )}

            <div>
              <div className="status-message">
                {statusMessage}
              </div>

              {job?.jobId && (
                <div className="job-id">
                  Job: {job.jobId}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Convert Button */}
        {file && status !== 'completed' && (
          <button
            type="button"
            className="convert-button"
            onClick={handleConvert}
            disabled={isBusy}
          >
            {isBusy
              ? 'Converting...'
              : `Convert to ${targetFormat.toUpperCase()}`}
          </button>
        )}

        {/* Download */}
        {status === 'completed' && downloadUrl && (
          <div className="download-section">

            <button
              type="button"
              className="download-button"
              onClick={handleDownload}
            >
              ↓ Download converted file
            </button>

            <button
              type="button"
              className="convert-another-button"
              onClick={handleReset}
            >
              Convert another file
            </button>

          </div>
        )}

      </div>
    </div>
  );
}

function formatFileSize(bytes) {
  if (!bytes) {
    return '0 Bytes';
  }

  const units = [
    'Bytes',
    'KB',
    'MB',
    'GB',
  ];

  const index = Math.floor(
    Math.log(bytes) / Math.log(1024)
  );

  const size =
    bytes / Math.pow(1024, index);

  return `${size.toFixed(index === 0 ? 0 : 2)} ${
    units[index]
  }`;
}