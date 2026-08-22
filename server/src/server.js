require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const sentencesRouter = require('./routes/sentences');
const passagesRouter = require('./routes/passages');
const sessionsRouter = require('./routes/sessions');
const ttsRouter = require('./routes/tts');

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// API Routes
app.use('/api/sentences', sentencesRouter);
app.use('/api/passages', passagesRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/tts', ttsRouter);

// Centralized error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server
const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Startup error: ${error.message}`);
    process.exit(1);
  }
};

start();
