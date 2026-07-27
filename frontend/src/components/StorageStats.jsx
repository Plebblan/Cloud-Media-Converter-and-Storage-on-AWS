import React from 'react';
import { HardDrive, Film, Music, Image, Cpu, CheckCircle } from 'lucide-react';
import { formatBytes } from '../utils/mediaHelpers';

export default function StorageStats({ files }) {
  const TOTAL_CAPACITY = 10 * 1024 * 1024 * 1024; // 10 GB

  const stats = files.reduce(
    (acc, file) => {
      acc.totalUsed += file.size || 0;
      if (file.type === 'video') acc.video += file.size || 0;
      else if (file.type === 'audio') acc.audio += file.size || 0;
      else if (file.type === 'image') acc.image += file.size || 0;
      return acc;
    },
    { totalUsed: 0, video: 0, audio: 0, image: 0 }
  );

  const usedPercentage = Math.min(100, Math.max(2, (stats.totalUsed / TOTAL_CAPACITY) * 100));
  const videoPct = (stats.video / TOTAL_CAPACITY) * 100;
  const audioPct = (stats.audio / TOTAL_CAPACITY) * 100;
  const imagePct = (stats.image / TOTAL_CAPACITY) * 100;

  return (
    <div className="glass-panel" style={{ padding: '20px 24px', margin: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <HardDrive size={22} className="gradient-text" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Cloud Storage Usage</h3>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>{formatBytes(stats.totalUsed)}</span> / {formatBytes(TOTAL_CAPACITY)} ({(usedPercentage).toFixed(1)}% Used)
        </div>
      </div>

      {/* Multi-segment Progress Bar */}
      <div style={{
        height: '10px',
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: '8px',
        overflow: 'hidden',
        display: 'flex',
        marginBottom: '18px',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
      }}>
        <div style={{ width: `${videoPct}%`, background: 'linear-gradient(90deg, var(--primary-cyan), var(--primary-blue))', transition: 'width 0.5s ease' }} title={`Video: ${formatBytes(stats.video)}`} />
        <div style={{ width: `${audioPct}%`, background: 'linear-gradient(90deg, var(--accent-pink), var(--primary-purple))', transition: 'width 0.5s ease' }} title={`Audio: ${formatBytes(stats.audio)}`} />
        <div style={{ width: `${imagePct}%`, background: 'linear-gradient(90deg, var(--accent-green), #00b0ff)', transition: 'width 0.5s ease' }} title={`Image: ${formatBytes(stats.image)}`} />
      </div>

      {/* Legend & Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <Film size={18} color="var(--primary-cyan)" />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Videos</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{formatBytes(stats.video)}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <Music size={18} color="var(--accent-pink)" />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Audio</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{formatBytes(stats.audio)}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <Image size={18} color="var(--accent-green)" />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Images</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{formatBytes(stats.image)}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <Cpu size={18} color="var(--accent-amber)" />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>FFmpeg Transcoder</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle size={14} /> Ready
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
