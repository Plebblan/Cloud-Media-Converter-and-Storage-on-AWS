import React, { useState, useRef } from 'react';
import { UploadCloud, X, File, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatBytes } from '../utils/mediaHelpers';
import { requestPresignedUrl } from '../services/api';
import { uploadToS3 } from '../services/s3-upload';

export default function FileUploader({ isOpen, onClose, onUploadComplete }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (files) => {
    const processed = files.map((file) => {
      let type = 'image';
      let format = file.name.split('.').pop().toLowerCase();

      if (file.type.startsWith('video/') || ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(format)) {
        type = 'video';
      } else if (file.type.startsWith('audio/') || ['mp3', 'wav', 'aac', 'flac', 'ogg'].includes(format)) {
        type = 'audio';
      }

      return {
        id: 'upload-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
        name: file.name,
        type,
        format,
        size: file.size,
        duration: type === 'video' ? '03:15' : type === 'audio' ? '04:00' : 'N/A',
        resolution: type === 'video' ? '1920x1080' : type === 'image' ? '2560x1440' : 'N/A',
        codec: type === 'video' ? 'H.264 / AAC' : type === 'audio' ? 'PCM' : 'Standard',
        uploadedAt: new Date().toISOString(),
        thumbnail: type === 'image' 
          ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'
          : type === 'video'
          ? 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80'
          : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
        previewUrl: URL.createObjectURL(file)
      };
    });

    setSelectedFiles((prev) => [...prev, ...processed]);
  };

  const removeFile = (id) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleUploadSubmit = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setError('');

    try {
      for (const file of selectedFiles) {
        const { uploadUrl } = await requestPresignedUrl({
          fileName: file.name,
          targetFormat: file.format || 'mp4',
        });

        await uploadToS3(file, uploadUrl);
      }

      onUploadComplete(selectedFiles);
      setSelectedFiles([]);
      onClose();
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel" style={{ width: '100%', maxWidth: '580px', padding: '28px', position: 'relative' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Upload Media Files</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Upload video, audio, or image files to your cloud transcode vault.
            </p>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragActive ? 'var(--primary-cyan)' : 'var(--border-color)'}`,
            borderRadius: '16px',
            padding: '36px 20px',
            textAlign: 'center',
            background: dragActive ? 'rgba(0, 242, 254, 0.05)' : 'rgba(0, 0, 0, 0.2)',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            marginBottom: '20px'
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="video/*,audio/*,image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(0, 242, 254, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px auto',
            color: 'var(--primary-cyan)'
          }}>
            <UploadCloud size={30} />
          </div>
          <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '4px' }}>
            Click or drag & drop files here
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Supports MP4, MOV, AVI, WEBM, WAV, MP3, AAC, PNG, JPG, WEBP (Up to 500MB each)
          </p>
        </div>

        {/* Selected File List */}
        {selectedFiles.length > 0 && (
          <div style={{ maxHeight: '180px', overflowY: 'auto', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {selectedFiles.map((file) => (
              <div key={file.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.04)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                  <File size={18} color="var(--primary-cyan)" />
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {file.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatBytes(file.size)} • {file.format.toUpperCase()}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div style={{ marginBottom: '16px', color: 'var(--accent-red, #ff6b6b)', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={onClose} disabled={uploading}>
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleUploadSubmit}
            disabled={selectedFiles.length === 0 || uploading}
          >
            {uploading ? (
              <>
                <div style={{ width: '16px', height: '16px', border: '2px solid #050b14', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <span>Uploading...</span>
              </>
            ) : (
              <span>Confirm & Upload ({selectedFiles.length})</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
