import React from 'react';
import { Cloud, HardDrive, RefreshCw, Upload, Sparkles, LayoutGrid, List } from 'lucide-react';

export default function Navbar({
  onUploadClick,
  viewMode,
  setViewMode,
  activeTab,
  setActiveTab,
  onLogout
}) {
  return (
    <header className="glass-panel" style={{ margin: '20px 20px 0 20px', padding: '16px 28px', borderRadius: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--primary-cyan), var(--primary-purple))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0, 242, 254, 0.35)'
          }}>
            <Cloud size={26} color="#050b14" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0 }}>
                CloudConvert <span className="gradient-text">Pro</span>
              </h1>
              <span className="badge" style={{ background: 'rgba(0, 242, 254, 0.15)', color: 'var(--primary-cyan)', fontSize: '0.65rem' }}>
                v2.5 Hybrid Engine
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Cloud File System & Media Transcoder Engine
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0, 0, 0, 0.3)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          {['all', 'video', 'audio', 'image'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? 'linear-gradient(135deg, var(--primary-cyan), var(--primary-blue))' : 'transparent',
                color: activeTab === tab ? '#050b14' : 'var(--text-muted)',
                fontWeight: activeTab === tab ? 700 : 500,
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                textTransform: 'capitalize',
                transition: 'all 0.2s ease'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Controls Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* View Mode Toggle */}
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                color: viewMode === 'grid' ? 'var(--primary-cyan)' : 'var(--text-muted)',
                border: 'none',
                padding: '6px 10px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
              title="Grid View"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                background: viewMode === 'list' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                color: viewMode === 'list' ? 'var(--primary-cyan)' : 'var(--text-muted)',
                border: 'none',
                padding: '6px 10px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>

          {/* Upload Button */}
          <button className="btn btn-primary" onClick={onUploadClick}>
            <Upload size={18} />
            <span>Upload Media</span>
          </button>

          <button className="btn"
            onClick={onLogout}
            style={{
              background: "#dc2626",
              color: "white",
              border: "none"
              }}
            >
            Logout
          </button>

        </div>

      </div>
    </header>
  );
}
