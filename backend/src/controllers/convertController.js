import { processConversion } from '../services/ffmpegService.js';

const activeJobs = new Map();

export const startConversion = async (req, res) => {
  try {
    const { fileId, targetFormat, options } = req.body;
    if (!fileId || !targetFormat) {
      return res.status(400).json({ success: false, message: 'fileId and targetFormat are required' });
    }

    const jobId = 'job-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const jobState = {
      jobId,
      fileId,
      targetFormat,
      options: options || {},
      status: 'processing',
      progress: 0,
      startedAt: new Date().toISOString()
    };
    activeJobs.set(jobId, jobState);

    // Trigger async job processor
    processConversion(jobId, jobState, (updatedJob) => {
      activeJobs.set(jobId, updatedJob);
    });

    res.status(202).json({ success: true, jobId, message: 'Conversion job queued.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = activeJobs.get(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getSupportedFormats = (req, res) => {
  res.json({
    success: true,
    formats: {
      video: ['mp4', 'webm', 'mov', 'avi', 'mkv', 'gif'],
      audio: ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a'],
      image: ['png', 'jpg', 'webp', 'svg', 'gif', 'bmp']
    }
  });
};
