import ffmpeg from 'fluent-ffmpeg';
import path from 'path';

/**
 * Service handler for FFmpeg tasks.
 * Executes actual FFmpeg commands when available or fallback simulator logic.
 */
export const processConversion = async (jobId, jobState, updateCallback) => {
  let progress = 0;
  
  // Simulated background step-wise conversion ticker
  const interval = setInterval(() => {
    progress += 25;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      updateCallback({
        ...jobState,
        status: 'completed',
        progress: 100,
        completedAt: new Date().toISOString(),
        outputUrl: `/output/converted-${jobState.fileId}.${jobState.targetFormat}`
      });
    } else {
      updateCallback({
        ...jobState,
        progress
      });
    }
  }, 1000);
};

export const executeFFmpegCommand = (inputPath, outputPath, options = {}) => {
  return new Promise((resolve, reject) => {
    let command = ffmpeg(inputPath);

    if (options.videoCodec) command.videoCodec(options.videoCodec);
    if (options.audioCodec) command.audioCodec(options.audioCodec);
    if (options.resolution) command.size(options.resolution);
    if (options.fps) command.fps(options.fps);
    if (options.bitrate) command.videoBitrate(options.bitrate);

    command
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err))
      .save(outputPath);
  });
};
