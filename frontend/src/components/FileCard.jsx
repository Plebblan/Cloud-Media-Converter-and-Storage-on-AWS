import React from 'react';
import { Film, Music, Image, Play, RefreshCw, Download, Trash2, Info, Eye } from 'lucide-react';
import { formatBytes } from '../utils/mediaHelpers';

export default function FileCard({ file, viewMode, onConvert, onPreview, onDelete }) {
  const getIcon = () => {
    if (file.type === 'video') return <Film size={18} color="var(--primary-cyan)" />;
    if (file.type === 'audio') return <Music size={18} color="var(--accent-pink)" />;
    return <Image size={18} color="var(--accent-green)" />;
  };

  const getBadgeClass = () => {
    if (file.type === 'video') return 'badge-video';
    if (file.type === 'audio') return 'badge-audio';
    return 'badge-image';
  };

  if (viewMode === 'list') {
    return (
      <div 
        className="glass-panel" 
        style={{ 
          display: 'grid',
          gridTemplateColumns: 'auto 2fr 1fr 1fr 1fr auto',
          alignItems: 'center',
          gap: '16px',
          padding: '14px 20px',
          borderRadius: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '8px', overflow: 'hidden', background: '#101726', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {file.thumbnail ? (
              <img src={file.thumbnail} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              getIcon()
            )}
          </div>
        </div>

        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontWeight: 600, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {file.name}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: '10px' }}>
            <span>{file.codec || 'Standard'}</span>
            <span>•</span>
            <span>{file.resolution !== 'N/A' ? file.resolution : file.duration}</span>
          </div>
        </div>

        <div>
          <span className={`badge ${getBadgeClass()}`}>{file.format.toUpperCase()}</span>
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {formatBytes(file.size)}
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
          {new Date(file.uploadedAt).toLocaleDateString()}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => onPreview(file)} title="Preview Media">
            <Eye size={14} />
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => onConvert(file)} title="Convert Format">
            <RefreshCw size={14} />
            <span>Convert</span>
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(file.id)} title="Delete File">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      
      {/* Thumbnail Banner */}
      <div style={{ position: 'relative', height: '150px', background: '#0a0f1d', overflow: 'hidden' }}>
        {file.thumbnail ? (
          <img 
            src={file.thumbnail} 
            alt={file.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85, transition: 'transform 0.3s ease' }} 
          />
        ) : (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
            {getIcon()}
          </div>
        )}
        
        {/* Overlay Badges */}
        <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
          <span className={`badge ${getBadgeClass()}`}>{file.format.toUpperCase()}</span>
        </div>

        <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
          <button 
            onClick={() => onPreview(file)}
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              cursor: 'pointer'
            }}
            title="Preview"
          >
            <Play size={14} style={{ marginLeft: '2px' }} />
          </button>
        </div>
      </div>

      {/* Body Content */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', gap: '14px' }}>
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={file.name}>
            {file.name}
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <span>{formatBytes(file.size)}</span>
            <span>{file.resolution !== 'N/A' ? file.resolution : file.duration}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
          <button 
            className="btn btn-primary" 
            style={{ flex: 1, padding: '8px' }} 
            onClick={() => onConvert(file)}
          >
            <RefreshCw size={14} />
            <span>Convert</span>
          </button>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => onPreview(file)}
            title="Details & Preview"
          >
            <Info size={14} />
          </button>
          <button 
            className="btn btn-danger btn-sm" 
            onClick={() => onDelete(file.id)}
            title="Delete File"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

    </div>
  );
}
