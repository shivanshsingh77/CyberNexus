import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { scanWebsiteHeaders } from '../controllers/scannerController.js';

const router = Router();

// Dedicated rate limiter to prevent abuse of the scanner tool
const scannerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 scans per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Scanner rate limit exceeded. Please wait a few minutes before scanning additional URLs.',
  },
});

router.post('/scan', scannerLimiter, scanWebsiteHeaders);

export default router;
