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
  { value: 'mp3', label: 'MP3', description: 'Audio' },
  { value: 'wav', label: 'WAV', description: 'Audio' },
];

const POLL_INTERVAL = 3000;

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

      const result = await requestPresignedUrl(
        file,
        targetFormat
      );

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

    const checkStatus = async () => {
      try {
        const result = await getJobStatus(job.jobId);

        if (cancelled) return;

        const updatedJob = result.job || result;

        setJob((previous) => ({
          ...previous,
          ...updatedJob,
        }));

        const currentStatus = updatedJob.status;

        if (
          currentStatus === 'COMPLETED' ||
          currentStatus === 'COMPLETE' ||
          currentStatus === 'SUCCEEDED'
        ) {
          setStatus('completed');
          return;
        }

        if (
          currentStatus === 'FAILED' ||
          currentStatus === 'ERROR'
        ) {
          setStatus('error');
          setError(
            updatedJob.error ||
              'The conversion failed on the server.'
          );
          return;
        }

        setStatus('processing');
      } catch (err) {
        console.error('Job status error:', err);

        if (!cancelled) {
          setError(
            'Unable to check conversion status. Retrying...'
          );
        }
      }
    };

    checkStatus();

    const interval = setInterval(checkStatus, POLL_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [job?.jobId]);

  const downloadUrl =
    job?.downloadUrl ||
    job?.outputUrl ||
    job?.convertedFileUrl ||
    job?.downloadURL;

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
                <a
                  className="download-button"
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  <Download size={18} />
                  Download converted file
                </a>
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