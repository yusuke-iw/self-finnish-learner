const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/self-finnish-learner', {
      serverSelectionTimeoutMS: 2000 // fail fast if not running
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[WARNING] Database connection failed: ${error.message}`);
    console.warn(`[INFO] Server is starting in MEMORY FALLBACK MODE. Changes will not be saved to disk.`);
    return null;
  }
};

module.exports = connectDB;
