import React, { useState } from 'react';
import Navbar from './components/Navbar';
import StorageStats from './components/StorageStats';
import FileList from './components/FileList';
import FileUploader from './components/FileUploader';
import ConvertModal from './components/ConvertModal';
import MediaPreviewModal from './components/MediaPreviewModal';
import ConversionHistory from './components/ConversionHistory';
import { INITIAL_FILES } from './utils/mediaHelpers';
import Login from './components/Login';

export default function App() {
  const [files, setFiles] = useState(INITIAL_FILES);
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('all');

  const [loggedIn, setLoggedIn] = useState(
  localStorage.getItem("loggedIn") === "true"
  );
  
  // Login Handler
  const handleLogin = () => {
  localStorage.setItem("loggedIn", "true");
  setLoggedIn(true);
  };

  // Logout Handler
  const handleLogout = () => {
  localStorage.removeItem("loggedIn");
  setLoggedIn(false);
  };
  
  // Modals state
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [convertFile, setConvertFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  
  // Conversion Jobs State
  const [jobs, setJobs] = useState([]);

  // Upload Complete Handler
  const handleUploadComplete = (newFiles) => {
    setFiles((prev) => [...newFiles, ...prev]);
  };

  // Delete Handler
  const handleDeleteFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // Start Conversion Job Handler
  const handleStartConversion = ({ file, targetFormat, category, options }) => {
    const jobId = 'job-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5);
    const newJob = {
      id: jobId,
      originalFileId: file.id,
      originalName: file.name,
      targetFormat,
      category,
      options,
      status: 'converting',
      progress: 0,
      startedAt: new Date().toISOString()
    };

    setJobs((prev) => [newJob, ...prev]);

    // Ticker simulating FFmpeg transcoding process
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 20;
      if (currentProgress >= 100) {
        clearInterval(interval);
        
        // Mark job complete
        setJobs((prevJobs) =>
          prevJobs.map((j) =>
            j.id === jobId ? { ...j, status: 'completed', progress: 100 } : j
          )
        );

        // Add newly transcoded file to cloud storage!
        const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const convertedFileName = `${baseName}_converted.${targetFormat}`;
        
        const convertedFile = {
          id: 'converted-' + Date.now(),
          name: convertedFileName,
          type: category,
          format: targetFormat,
          size: Math.round(file.size * (category === 'audio' ? 0.4 : 0.8)),
          duration: file.duration || '03:30',
          resolution: options.resolution !== 'same' ? options.resolution : file.resolution,
          codec: targetFormat.toUpperCase() + ' Transcoded',
          uploadedAt: new Date().toISOString(),
          thumbnail: file.thumbnail,
          previewUrl: file.previewUrl
        };

        setFiles((prevFiles) => [convertedFile, ...prevFiles]);
      } else {
        setJobs((prevJobs) =>
          prevJobs.map((j) =>
            j.id === jobId ? { ...j, progress: currentProgress } : j
          )
        );
      }
    }, 800);
  };

  // Download Trigger Handler
  const handleDownloadJob = (job) => {
    const fakeContent = `Dummy transcoded media binary stream for ${job.originalName} (${job.targetFormat})`;
    const blob = new Blob([fakeContent], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcoded_${job.originalName}.${job.targetFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!loggedIn) {
    return (
      <Login
        onLogin={handleLogin}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Navbar */}
      <Navbar
        onUploadClick={() => setIsUploaderOpen(true)}
        viewMode={viewMode}
        setViewMode={setViewMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      {/* Cloud Storage Capacity Stats */}
      <StorageStats files={files} />

      {/* Conversion Queue (If Active Jobs Exist) */}
      <ConversionHistory jobs={jobs} onDownloadJob={handleDownloadJob} />

      {/* Main File Management Grid / List */}
      <main style={{ flex: 1 }}>
        <FileList
          files={files}
          viewMode={viewMode}
          activeTab={activeTab}
          onConvert={(file) => setConvertFile(file)}
          onPreview={(file) => setPreviewFile(file)}
          onDelete={handleDeleteFile}
        />
      </main>

      {/* Modals */}
      <FileUploader
        isOpen={isUploaderOpen}
        onClose={() => setIsUploaderOpen(false)}
        onUploadComplete={handleUploadComplete}
      />

      <ConvertModal
        file={convertFile}
        isOpen={!!convertFile}
        onClose={() => setConvertFile(null)}
        onStartConversion={handleStartConversion}
      />

      <MediaPreviewModal
        file={previewFile}
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        onConvert={(file) => setConvertFile(file)}
      />

      {/* Footer */}
      <footer style={{
        padding: '20px',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-dim)',
        borderTop: '1px solid var(--border-color)',
        background: 'rgba(5, 8, 17, 0.6)'
      }}>
        CloudConvert Pro • High-Efficiency Cloud Media Transcoding Engine • D:\fcaj\cloud-storage-converter
      </footer>

    </div>
  );
}
