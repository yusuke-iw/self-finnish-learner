const mongoose = require('mongoose');
const Progress = require('../models/Progress');

// In-memory fallback storage if MongoDB is disconnected
const inMemoryProgress = new Map();

const getDefaultProgress = (userId = 'default_user') => ({
  userId,
  learningPath: {},
  passagesProgress: {},
  passageAnswers: {},
  mistakes: [],
  settings: {
    language: 'ja'
  },
  updatedAt: new Date()
});

exports.getProgress = async (req, res, next) => {
  try {
    const userId = req.query.userId || 'default_user';

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
      settings
    } = req.body;

    const update = {
      userId,
      ...(learningPath !== undefined && { learningPath }),
      ...(passagesProgress !== undefined && { passagesProgress }),
      ...(passageAnswers !== undefined && { passageAnswers }),
      ...(mistakes !== undefined && { mistakes }),
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
