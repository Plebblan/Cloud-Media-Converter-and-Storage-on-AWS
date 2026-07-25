// Stub storage controller managing files and metrics
let sampleFiles = [];

export const getFiles = async (req, res) => {
  try {
    res.json({ success: true, files: sampleFiles });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getStorageStats = async (req, res) => {
  try {
    const totalSpace = 10 * 1024 * 1024 * 1024; // 10 GB
    const usedSpace = sampleFiles.reduce((acc, f) => acc + (f.size || 0), 0);
    res.json({
      success: true,
      totalSpace,
      usedSpace,
      freeSpace: totalSpace - usedSpace,
      fileCount: sampleFiles.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const uploadFiles = async (req, res) => {
  try {
    const uploaded = (req.files || []).map(f => ({
      id: 'file-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      name: f.originalname,
      size: f.size,
      mimeType: f.mimetype,
      path: f.path,
      uploadedAt: new Date().toISOString()
    }));
    sampleFiles.push(...uploaded);
    res.status(201).json({ success: true, files: uploaded });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    sampleFiles = sampleFiles.filter(f => f.id !== id);
    res.json({ success: true, message: `File ${id} deleted successfully.` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
