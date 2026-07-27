import React from 'react';
import { X, Play, Download, Film, Music, Image, ShieldCheck, HardDrive, Calendar } from 'lucide-react';
import { formatBytes } from '../utils/mediaHelpers';

export default function MediaPreviewModal({ file, isOpen, onClose, onConvert }) {
  if (!isOpen || !file) return null;

  return (
    <div className="modal-overlay">
      <div className="glass-panel" style={{ width: '100%', maxWidth: '780px', padding: '0', borderRadius: '20px', overflow: 'hidden' }}>
        
        {/* Media Preview Header Banner */}
        <div style={{ position: 'relative', background: '#050811', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '260px', maxHeight: '420px', overflow: 'hidden' }}>
          
          <button 
            onClick={onClose} 
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              zIndex: 10,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>

          {file.type === 'video' ? (
            <video 
              controls 
              src={file.previewUrl} 
              poster={file.thumbnail}
              style={{ width: '100%', maxHeight: '380px', objectFit: 'contain' }} 
            />
          ) : file.type === 'audio' ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', width: '100%', maxWidth: '480px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-pink), var(--primary-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', boxShadow: '0 0 30px rgba(255, 0, 122, 0.4)' }}>
                <Music size={36} color="#fff" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>{file.name}</h3>
              <audio controls src={file.previewUrl} style={{ width: '100%' }} />
            </div>
          ) : (
            <img 
              src={file.previewUrl || file.thumbnail} 
              alt={file.name} 
              style={{ maxWidth: '100%', maxHeight: '380px', objectFit: 'contain' }} 
            />
          )}

        </div>

        {/* Technical Metadata Inspector Body */}
        <div style={{ padding: '24px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="badge badge-video" style={{ textTransform: 'uppercase' }}>{file.format}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {file.id}</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{file.name}</h3>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => { onClose(); onConvert(file); }}
              >
                Transcode Media
              </button>
            </div>
          </div>

          {/* Technical Specs Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>File Size</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{formatBytes(file.size)}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Codec Engine</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{file.codec || 'Auto'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Resolution / Specs</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{file.resolution || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Duration / Frame Rate</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{file.duration || 'N/A'} {file.fps ? `(${file.fps} fps)` : ''}</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
