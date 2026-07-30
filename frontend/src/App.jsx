import React, { useEffect, useState } from 'react';
import { Download, FileVideo, Loader2, Upload, X } from 'lucide-react';
import {
  getJobStatus,
  requestPresignedUrl,
} from './services/api';
import './index.css';

const FORMAT_OPTIONS = [
  { value: 'mp4', label: 'MP4', description: 'Video' },
  { value: 'webm', label: 'WebM', description: 'Video' },
  { value: 'mov', label: 'MOV', description: 'Video' },
  { value: 'mp3', label: 'MP3', description: 'Audio' },
  { value: 'wav', label: 'WAV', description: 'Audio' },
  { value: 'aac', label: 'AAC', description: 'Audio' },
  { value: 'jpg', label: 'JPG', description: 'Image' },
  { value: 'jpeg', label: 'JPEG', description: 'Image' },
  { value: 'png', label: 'PNG', description: 'Image' },
  { value: 'webp', label: 'WebP', description: 'Image' },
];

const INITIAL_POLL_INTERVAL = 1000;
const MAX_POLL_INTERVAL = 10000;
const POLL_BACKOFF_MULTIPLIER = 2;

function App() {
  const [file, setFile] = useState(null);
  const [targetFormat, setTargetFormat] = useState('mp4');

  const [job, setJob] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setJob(null);
    setError('');
    setStatus('idle');
  };

  const handleFileInput = (event) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      handleFileSelect(selectedFile);
    }

    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    const droppedFile = event.dataTransfer.files?.[0];

    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setJob(null);
    setError('');
    setStatus('idle');
  };

  const startConversion = async () => {
    if (!file) return;

    try {
      setError('');
      setStatus('uploading');

      const result = await requestPresignedUrl({
        fileName: file.name,
        targetFormat: targetFormat,
      });

      const uploadResponse = await fetch(result.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file, // Direct File blob stream
      });

      if (!uploadResponse.ok) {
        throw new Error(`S3 upload failed with status ${uploadResponse.status}`);
      }

      setJob({
        ...result,
        status: 'PENDING_UPLOAD',
      });

      setStatus('processing');
    } catch (err) {
      console.error(err);

      setError(
        err.message || 'Something went wrong while uploading the file.'
      );

      setStatus('error');
    }
  };

  /*
   * Poll the backend until the conversion Lambda finishes.
   */
  useEffect(() => {
    if (!job?.jobId) return;

    let cancelled = false;
    let timeoutId = null;
    let pollAttempt = 0;

    const scheduleNextPoll = (delayMs) => {
      if (cancelled) return;

      timeoutId = setTimeout(() => {
        void checkStatus();
      }, delayMs);
    };

    const checkStatus = async () => {
      try {
        const result = await getJobStatus(job.jobId);

        if (cancelled) return;

        const updatedJob = result.job || result;
        const normalizedStatus = String(updatedJob.status || '').toUpperCase();

        setJob((previous) => ({
          ...(previous || {}),
          ...updatedJob,
          downloadUrl:
            updatedJob.downloadUrl ||
            updatedJob.outputUrl ||
            updatedJob.convertedFileUrl ||
            updatedJob.downloadURL ||
            previous?.downloadUrl,
        }));

        if (
          ['COMPLETED', 'COMPLETE', 'SUCCEEDED', 'DONE'].includes(normalizedStatus)
        ) {
          setStatus('completed');
          return;
        }

        if (
          ['FAILED', 'ERROR', 'CANCELLED', 'CANCELED'].includes(normalizedStatus)
        ) {
          setStatus('error');
          setError(
            updatedJob.error ||
              updatedJob.errorMessage ||
              'The conversion failed on the server.'
          );
          return;
        }

        setStatus('processing');
        const nextDelay = Math.min(
          INITIAL_POLL_INTERVAL * POLL_BACKOFF_MULTIPLIER ** pollAttempt,
          MAX_POLL_INTERVAL
        );
        pollAttempt += 1;
        scheduleNextPoll(nextDelay);
      } catch (err) {
        console.error('Job status error:', err);

        if (!cancelled) {
          setError('Unable to check conversion status. Retrying...');
          const nextDelay = Math.min(
            INITIAL_POLL_INTERVAL * POLL_BACKOFF_MULTIPLIER ** pollAttempt,
            MAX_POLL_INTERVAL
          );
          pollAttempt += 1;
          scheduleNextPoll(nextDelay);
        }
      }
    };

    void checkStatus();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [job?.jobId]);

  const downloadUrl =
    job?.downloadUrl ||
    job?.outputUrl ||
    job?.convertedFileUrl ||
    job?.downloadURL;

  const handleDownload = (event) => {
    if (!downloadUrl) return;

    event.preventDefault();

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = file?.name
      ? `${file.name.replace(/\.[^.]+$/, '')}.${targetFormat}`
      : `converted.${targetFormat}`;
    link.target = '_self';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';

    const units = ['B', 'KB', 'MB', 'GB'];
    const index = Math.floor(
      Math.log(bytes) / Math.log(1024)
    );

    return `${(bytes / Math.pow(1024, index)).toFixed(1)} ${
      units[index]
    }`;
  };

  return (
    <div className="converter-page">
      <header className="converter-header">
        <div className="logo">
          <FileVideo size={24} />
          <span>CloudConvert</span>
        </div>
      </header>

      <main className="converter-main">
        <section className="converter-card">
          <div className="converter-title">
            <h1>Convert your file</h1>
            <p>
              Upload a file, choose your format, and let the
              cloud handle the conversion.
            </p>
          </div>

          {!file && (
            <label
              className={`drop-zone ${
                isDragging ? 'dragging' : ''
              }`}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input
                type="file"
                onChange={handleFileInput}
                hidden
              />

              <div className="upload-icon">
                <Upload size={30} />
              </div>

              <h2>Drop your file here</h2>

              <p>
                or <span>browse from your computer</span>
              </p>

              <small>
                Your file will be uploaded securely to the cloud.
              </small>
            </label>
          )}

          {file && (
            <div className="selected-file">
              <div className="file-information">
                <div className="file-icon">
                  <FileVideo size={24} />
                </div>

                <div className="file-details">
                  <strong>{file.name}</strong>

                  <span>
                    {formatFileSize(file.size)}
                  </span>
                </div>
              </div>

              {status === 'idle' && (
                <button
                  className="remove-file"
                  onClick={removeFile}
                  type="button"
                  aria-label="Remove file"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          )}

          {file && status === 'idle' && (
            <>
              <div className="format-section">
                <h3>Convert to</h3>

                <div className="format-grid">
                  {FORMAT_OPTIONS.map((format) => (
                    <button
                      key={format.value}
                      type="button"
                      className={`format-option ${
                        targetFormat === format.value
                          ? 'selected'
                          : ''
                      }`}
                      onClick={() =>
                        setTargetFormat(format.value)
                      }
                    >
                      <strong>{format.label}</strong>
                      <span>{format.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="convert-button"
                onClick={startConversion}
                type="button"
              >
                Convert to {targetFormat.toUpperCase()}
              </button>
            </>
          )}

          {status === 'uploading' && (
            <div className="status-box">
              <Loader2
                size={28}
                className="spinner"
              />

              <h3>Uploading your file...</h3>

              <p>
                Securely sending your file to the cloud.
              </p>
            </div>
          )}

          {status === 'processing' && (
            <div className="status-box">
              <Loader2
                size={28}
                className="spinner"
              />

              <h3>Converting your file...</h3>

              <p>
                Your file is being processed. This may take a
                little while.
              </p>

              {job?.status && (
                <span className="job-status">
                  {job.status}
                </span>
              )}
            </div>
          )}

          {status === 'completed' && (
            <div className="status-box success">
              <div className="success-icon">
                ✓
              </div>

              <h3>Conversion complete!</h3>

              <p>
                Your {targetFormat.toUpperCase()} file is ready.
              </p>

              {downloadUrl ? (
                <button
                  className="download-button"
                  type="button"
                  onClick={handleDownload}
                >
                  <Download size={18} />
                  Download converted file
                </button>
              ) : (
                <p className="download-warning">
                  Conversion finished, but the backend has not
                  returned a download URL yet.
                </p>
              )}

              <button
                className="start-again-button"
                type="button"
                onClick={removeFile}
              >
                Convert another file
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="status-box error">
              <h3>Conversion failed</h3>

              <p>
                {error || 'Something went wrong.'}
              </p>

              <button
                className="start-again-button"
                type="button"
                onClick={() => {
                  setStatus('idle');
                  setError('');
                }}
              >
                Try again
              </button>
            </div>
          )}

          {error && status !== 'error' && (
            <div className="inline-error">
              {error}
            </div>
          )}
        </section>
      </main>

      <footer className="converter-footer">
        CloudConvert · Simple cloud media conversion
      </footer>
    </div>
  );
}

export default App;