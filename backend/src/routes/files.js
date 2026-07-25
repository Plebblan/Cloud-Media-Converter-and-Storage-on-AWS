import express from 'express';
import { getFiles, uploadFiles, deleteFile, getStorageStats } from '../controllers/fileController.js';
import { uploadMiddleware } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getFiles);
router.get('/stats', getStorageStats);
router.post('/upload', uploadMiddleware.array('files', 10), uploadFiles);
router.delete('/:id', deleteFile);

export default router;
