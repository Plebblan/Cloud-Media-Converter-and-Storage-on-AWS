import React, { useState } from 'react';
import { Search, Filter, FolderOpen, ArrowUpDown } from 'lucide-react';
import FileCard from './FileCard';

export default function FileList({ files, viewMode, activeTab, onConvert, onPreview, onDelete }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date' | 'name' | 'size'

  // Filtering
  const filteredFiles = files.filter((file) => {
    const matchesTab = activeTab === 'all' || file.type === activeTab;
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          file.format.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Sorting
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'size') return b.size - a.size;
    return new Date(b.uploadedAt) - new Date(a.uploadedAt);
  });

  return (
    <div style={{ padding: '0 20px 40px 20px' }}>
      
      {/* Search & Filter Toolbar */}
      <div className="glass-panel" style={{ padding: '14px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        
        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '260px', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search files by title, format, or codec..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 40px',
              borderRadius: '10px',
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Sorting Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <ArrowUpDown size={16} />
            <span>Sort by:</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="date" style={{ background: '#0a0f1d' }}>Upload Date</option>
            <option value="name" style={{ background: '#0a0f1d' }}>File Name</option>
            <option value="size" style={{ background: '#0a0f1d' }}>File Size</option>
          </select>
        </div>

      </div>

      {/* Grid or List Display */}
      {sortedFiles.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <FolderOpen size={48} color="var(--text-dim)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>No media files found</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Upload files or clear your search filter to view your cloud files.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
          {sortedFiles.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              viewMode="grid"
              onConvert={onConvert}
              onPreview={onPreview}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sortedFiles.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              viewMode="list"
              onConvert={onConvert}
              onPreview={onPreview}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

    </div>
  );
}
