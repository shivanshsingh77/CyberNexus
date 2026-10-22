import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

import { globalLimiter } from './middleware/rateLimiter.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import securityAuditRoutes from './routes/securityAuditRoutes.js';
import scannerRoutes from './routes/scannerRoutes.js';

const app = express();

// 1. Explicitly remove X-Powered-By header to prevent fingerprinting
app.disable('x-powered-by');

// 2. Helmet Security Headers configuration
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", process.env.CLIENT_URL || 'http://localhost:5173'],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// 3. CORS Configuration
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true, // Allow cookies across origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 4. Request Body Parsers with safe payload limits
app.use(express.json({ limit: '10kb' })); // Prevents large payload DoS attacks
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// 5. Apply Global Rate Limiting
app.use('/api', globalLimiter);

// 6. Health Check API
app.get('/api/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    status: 'healthy',
    message: 'CyberNexus API is running smoothly.',
    service: 'CyberNexus Security Engine',
    uptime: `${Math.floor(process.uptime())}s`,
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// 7. Mount Core Application Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/audit', securityAuditRoutes);
app.use('/api/scanner', scannerRoutes);

// 8. Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
