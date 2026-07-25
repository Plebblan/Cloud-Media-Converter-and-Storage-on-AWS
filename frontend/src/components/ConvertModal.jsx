import React, { useState } from 'react';
import { RefreshCw, X, Sliders, Settings, CheckCircle2, Zap, Film, Music, Image } from 'lucide-react';
import { FORMAT_OPTIONS, RESOLUTION_PRESETS, formatBytes } from '../utils/mediaHelpers';

export default function ConvertModal({ file, isOpen, onClose, onStartConversion }) {
  if (!isOpen || !file) return null;

  const [category, setCategory] = useState(file.type);
  const [targetFormat, setTargetFormat] = useState(
    FORMAT_OPTIONS[file.type] ? FORMAT_OPTIONS[file.type][0].value : 'mp4'
  );
  const [resolution, setResolution] = useState('same');
  const [bitrate, setBitrate] = useState('auto');
  const [fps, setFps] = useState('original');
  const [audioExtract, setAudioExtract] = useState(false);

  const availableFormats = FORMAT_OPTIONS[category] || FORMAT_OPTIONS.video;

  const handleSubmit = (e) => {
    e.preventDefault();
    onStartConversion({
      file,
      targetFormat,
      category,
      options: {
        resolution,
        bitrate,
        fps,
        audioExtract
      }
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel" style={{ width: '100%', maxWidth: '640px', padding: '28px', position: 'relative' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--primary-cyan), var(--primary-purple))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#050b14'
            }}>
              <RefreshCw size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Transcode & Convert Media</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Target File: <span style={{ color: 'var(--primary-cyan)', fontWeight: 600 }}>{file.name}</span> ({formatBytes(file.size)})
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* Target Type Selector */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
              Target Category
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {[
                { type: 'video', icon: Film, label: 'Video' },
                { type: 'audio', icon: Music, label: 'Audio' },
                { type: 'image', icon: Image, label: 'Image' }
              ].map((cat) => {
                const IconComponent = cat.icon;
                const active = category === cat.type;
                return (
                  <button
                    key={cat.type}
                    type="button"
                    onClick={() => {
                      setCategory(cat.type);
                      setTargetFormat(FORMAT_OPTIONS[cat.type][0].value);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '10px',
                      borderRadius: '10px',
                      border: `1px solid ${active ? 'var(--primary-cyan)' : 'var(--border-color)'}`,
                      background: active ? 'rgba(0, 242, 254, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      color: active ? 'var(--primary-cyan)' : 'var(--text-muted)',
                      fontWeight: active ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <IconComponent size={16} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Format Picker */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
              Output Format Target
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px', maxHeight: '160px', overflowY: 'auto' }}>
              {availableFormats.map((fmt) => (
                <div
                  key={fmt.value}
                  onClick={() => setTargetFormat(fmt.value)}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: `1px solid ${targetFormat === fmt.value ? 'var(--primary-cyan)' : 'var(--border-color)'}`,
                    background: targetFormat === fmt.value ? 'rgba(0, 242, 254, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: targetFormat === fmt.value ? 'var(--primary-cyan)' : 'var(--text-main)' }}>
                      {fmt.value.toUpperCase()}
                    </span>
                    {targetFormat === fmt.value && <CheckCircle2 size={16} color="var(--primary-cyan)" />}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: '1.2' }}>
                    {fmt.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Advanced Encoding Parameters */}
          <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700 }}>
              <Sliders size={16} />
              <span>Transcoder Parameters & Encoding Quality</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              
              {/* Resolution (for Video/Image) */}
              {(category === 'video' || category === 'image') && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Output Resolution
                  </label>
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      outline: 'none'
                    }}
                  >
                    {RESOLUTION_PRESETS.map((res) => (
                      <option key={res.value} value={res.value} style={{ background: '#0a0f1d' }}>
                        {res.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Bitrate */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Target Bitrate Quality
                </label>
                <select
                  value={bitrate}
                  onChange={(e) => setBitrate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    outline: 'none'
                  }}
                >
                  <option value="auto" style={{ background: '#0a0f1d' }}>Auto Smart Bitrate</option>
                  <option value="high" style={{ background: '#0a0f1d' }}>Ultra High Fidelity (Max)</option>
                  <option value="medium" style={{ background: '#0a0f1d' }}>Balanced Web Quality</option>
                  <option value="low" style={{ background: '#0a0f1d' }}>High Compression (Small File)</option>
                </select>
              </div>

            </div>
          </div>

          {/* Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-accent">
              <Zap size={16} />
              <span>Start Transcoding Job</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
