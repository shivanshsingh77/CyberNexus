import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

// Initialize Database connection and boot server
const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log('====================================================');
      console.log(`🛡️  CyberNexus Security Platform - Backend API`);
      console.log(`🌐 Server running at: http://localhost:${PORT}`);
      console.log(`🩺 Health check at:  http://localhost:${PORT}/api/health`);
      console.log(`🔒 Environment:       ${process.env.NODE_ENV || 'development'}`);
      console.log('====================================================');
    });

    // Graceful shutdown handling
    const shutdown = () => {
      console.log('\n[Server] Shutting down gracefully...');
      server.close(() => {
        console.log('[Server] Closed remaining connections.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error(`[Fatal Server Error] ${error.message}`);
    process.exit(1);
  }
};

startServer();
