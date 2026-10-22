import mongoose from 'mongoose';

/**
 * Connect to MongoDB instance using Mongoose.
 * Logs status clearly while avoiding credentials exposure.
 */
export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cybernexus';

  try {
    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true, // Build indexes for unique constraints
    });

    console.log(`[Database] MongoDB Connected: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    // Do not crash immediately in dev to allow diagnostics
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[Database] MongoDB connection disconnected.');
});

mongoose.connection.on('error', (err) => {
  console.error(`[Database] MongoDB runtime error: ${err.message}`);
});
