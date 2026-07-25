import express from 'express';
import { startConversion, getJobStatus, getSupportedFormats } from '../controllers/convertController.js';

const router = express.Router();

router.post('/', startConversion);
router.get('/status/:jobId', getJobStatus);
router.get('/formats', getSupportedFormats);

export default router;
