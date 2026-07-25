export const FORMAT_OPTIONS = {
  video: [
    { label: 'MP4 (H.264 / AAC)', value: 'mp4', description: 'Universal format for web & device compatibility' },
    { label: 'WEBM (VP9 / Opus)', value: 'webm', description: 'High efficiency open web video' },
    { label: 'MOV (ProRes / QuickTime)', value: 'mov', description: 'Apple QuickTime native video' },
    { label: 'AVI (Raw Video)', value: 'avi', description: 'Legacy uncompressed video format' },
    { label: 'GIF (Animated Image)', value: 'gif', description: 'Short looping animated graphic' }
  ],
  audio: [
    { label: 'MP3 (MPEG Audio)', value: 'mp3', description: 'Standard compressed audio format' },
    { label: 'WAV (Uncompressed PCM)', value: 'wav', description: 'Studio quality lossless audio' },
    { label: 'AAC (Advanced Audio)', value: 'aac', description: 'High fidelity modern compression' },
    { label: 'FLAC (Lossless)', value: 'flac', description: 'Free Lossless Audio Codec' }
  ],
  image: [
    { label: 'PNG (Lossless / Alpha)', value: 'png', description: 'High quality image with transparency support' },
    { label: 'JPG (Compressed)', value: 'jpg', description: 'Optimal size for photography' },
    { label: 'WEBP (Next-Gen Image)', value: 'webp', description: 'Ultra small file size for web speed' }
  ]
};

export const RESOLUTION_PRESETS = [
  { label: 'Original Resolution', value: 'same' },
  { label: '4K Ultra HD (3840x2160)', value: '3840x2160' },
  { label: '1080p Full HD (1920x1080)', value: '1920x1080' },
  { label: '720p HD (1280x720)', value: '1280x720' },
  { label: '480p SD (854x480)', value: '854x480' }
];

export const formatBytes = (bytes, decimals = 2) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const INITIAL_FILES = [
  {
    id: 'f-101',
    name: 'cyberpunk_city_timelapse_4k.mp4',
    type: 'video',
    format: 'mp4',
    size: 145000000, // ~138 MB
    duration: '02:45',
    resolution: '3840x2160',
    codec: 'H.264 / AAC',
    fps: 60,
    uploadedAt: '2026-07-25T14:30:00Z',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  },
  {
    id: 'f-102',
    name: 'ambient_synthwave_master_track.wav',
    type: 'audio',
    format: 'wav',
    size: 48000000, // ~45 MB
    duration: '04:12',
    resolution: 'N/A',
    codec: 'PCM 24-bit / 48kHz',
    uploadedAt: '2026-07-25T15:10:00Z',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    id: 'f-103',
    name: 'neofuturistic_concept_art.png',
    type: 'image',
    format: 'png',
    size: 18500000, // ~17.6 MB
    duration: 'N/A',
    resolution: '4096x2160',
    codec: 'PNG Lossless',
    uploadedAt: '2026-07-25T16:05:00Z',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'f-104',
    name: 'product_launch_keynote.mov',
    type: 'video',
    format: 'mov',
    size: 320000000, // ~305 MB
    duration: '12:18',
    resolution: '1920x1080',
    codec: 'ProRes 422',
    fps: 30,
    uploadedAt: '2026-07-25T17:40:00Z',
    thumbnail: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=600&q=80',
    previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
  }
];
