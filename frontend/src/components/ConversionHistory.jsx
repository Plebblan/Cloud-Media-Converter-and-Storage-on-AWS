import React from 'react';
import { Activity, CheckCircle2, Clock, Download, AlertCircle, RefreshCw } from 'lucide-react';
import { formatBytes } from '../utils/mediaHelpers';

export default function ConversionHistory({ jobs, onDownloadJob }) {
  if (!jobs || jobs.length === 0) return null;

  return (
    <div className="glass-panel" style={{ margin: '20px', padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity size={20} color="var(--primary-cyan)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Conversion Queue & Active Jobs</h3>
        </div>
        <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-muted)' }}>
          {jobs.filter(j => j.status === 'converting').length} Active
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {jobs.map((job) => (
          <div 
            key={job.id} 
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              padding: '14px 18px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {job.status === 'completed' ? (
                  <CheckCircle2 size={20} color="var(--accent-green)" />
                ) : job.status === 'converting' ? (
                  <RefreshCw size={20} color="var(--accent-amber)" style={{ animation: 'spin 1.5s linear infinite' }} />
                ) : (
                  <Clock size={20} color="var(--text-dim)" />
                )}
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    {job.originalName} <span style={{ color: 'var(--text-dim)' }}>→</span> <span style={{ color: 'var(--primary-cyan)' }}>.{job.targetFormat.toUpperCase()}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Target options: {job.options?.resolution !== 'same' ? job.options?.resolution : 'Original Res'} • {job.options?.bitrate} Bitrate
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className={`badge badge-status ${job.status === 'completed' ? 'status-completed' : 'status-converting'}`}>
                  {job.status === 'completed' ? 'Completed' : `Transcoding ${job.progress}%`}
                </span>
                
                {job.status === 'completed' && (
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => onDownloadJob(job)}
                  >
                    <Download size={14} />
                    <span>Download</span>
                  </button>
                )}
              </div>
            </div>

            {/* Progress bar for converting status */}
            {job.status === 'converting' && (
              <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    width: `${job.progress}%`, 
                    background: 'linear-gradient(90deg, var(--accent-amber), var(--primary-cyan))',
                    transition: 'width 0.3s ease'
                  }} 
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
