const mongoose = require('mongoose');
const Progress = require('../models/Progress');

// In-memory fallback storage if MongoDB is disconnected
const inMemoryProgress = new Map();

const USER_ID_REGEX = /^[A-Za-z0-9_-]{1,40}$/;
const isValidUserId = (userId) => typeof userId === 'string' && USER_ID_REGEX.test(userId);

const getDefaultProgress = (userId = 'default_user') => ({
  userId,
  learningPath: {},
  passagesProgress: {},
  passageAnswers: {},
  mistakes: [],
  sentenceMistakes: [],
  settings: {
    language: 'ja'
  },
  updatedAt: new Date()
});

exports.getProgress = async (req, res, next) => {
  try {
    const userId = req.query.userId === undefined ? 'default_user' : req.query.userId;

    if (!isValidUserId(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid userId'
      });
    }

    // If MongoDB is not connected, fallback to in-memory map
    if (mongoose.connection.readyState !== 1) {
      const record = inMemoryProgress.get(userId) || getDefaultProgress(userId);
      return res.json({
        success: true,
        data: record,
        source: 'memory'
      });
    }

    let progress = await Progress.findOne({ userId }).lean();

    if (!progress) {
      progress = getDefaultProgress(userId);
    } else {
      // Normalize Map objects if lean didn't convert them
      if (progress.learningPath instanceof Map) {
        progress.learningPath = Object.fromEntries(progress.learningPath);
      }
      if (progress.passagesProgress instanceof Map) {
        progress.passagesProgress = Object.fromEntries(progress.passagesProgress);
      }
      if (progress.passageAnswers instanceof Map) {
        progress.passageAnswers = Object.fromEntries(progress.passageAnswers);
      }
    }

    res.json({
      success: true,
      data: progress,
      source: 'database'
    });
  } catch (err) {
    next(err);
  }
};

exports.saveProgress = async (req, res, next) => {
  try {
    const {
      userId = 'default_user',
      learningPath,
      passagesProgress,
      passageAnswers,
      mistakes,
      sentenceMistakes,
      settings
    } = req.body;

    if (!isValidUserId(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid userId'
      });
    }

    const update = {
      userId,
      ...(learningPath !== undefined && { learningPath }),
      ...(passagesProgress !== undefined && { passagesProgress }),
      ...(passageAnswers !== undefined && { passageAnswers }),
      ...(mistakes !== undefined && { mistakes }),
      ...(sentenceMistakes !== undefined && { sentenceMistakes }),
      ...(settings !== undefined && { settings }),
      updatedAt: new Date()
    };

    // If MongoDB is not connected, fallback to in-memory map
    if (mongoose.connection.readyState !== 1) {
      const existing = inMemoryProgress.get(userId) || getDefaultProgress(userId);
      const merged = {
        ...existing,
        ...update,
        learningPath: { ...existing.learningPath, ...(learningPath || {}) },
        passagesProgress: { ...existing.passagesProgress, ...(passagesProgress || {}) },
        passageAnswers: { ...existing.passageAnswers, ...(passageAnswers || {}) },
        settings: { ...existing.settings, ...(settings || {}) }
      };
      inMemoryProgress.set(userId, merged);
      return res.json({
        success: true,
        data: merged,
        source: 'memory'
      });
    }

    const saved = await Progress.findOneAndUpdate(
      { userId },
      { $set: update },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    res.json({
      success: true,
      data: saved,
      source: 'database'
    });
  } catch (err) {
    next(err);
  }
};
