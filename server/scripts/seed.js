import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import User from '../src/models/User.js';

const seedData = async () => {
  try {
    await connectDB();

    const demoEmail = 'analyst@cybernexus.local';
    const existing = await User.findOne({ email: demoEmail });

    if (existing) {
      console.log(`[Seed] Demo user already exists: ${demoEmail}`);
    } else {
      await User.create({
        username: 'analyst_demo',
        email: demoEmail,
        password: 'CyberNexus@2026Secure!',
        role: 'analyst',
      });
      console.log(`[Seed] Created demo user account:`);
      console.log(`       Email:    ${demoEmail}`);
      console.log(`       Password: CyberNexus@2026Secure!`);
      console.log(`       Role:     analyst`);
    }
  } catch (error) {
    console.error(`[Seed Error] ${error.message}`);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seedData();
