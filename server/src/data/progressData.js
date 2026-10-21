const Progress = require('../models/Progress');
const { isDbConnected } = require('./connection');

// In-memory fallback storage if MongoDB is disconnected
const inMemoryProgress = new Map();

const getDefaultProgress = (userId = 'default_user') => ({
  userId,
  learningPath: {},
  passagesProgress: {},
  passageAnswers: {},
  mistakes: [],
  sentenceMistakes: [],
  wordBook: [],
  reviewSchedule: {},
  studyStats: {},
  settings: {
    language: 'ja'
  },
  updatedAt: new Date()
});

// Returns { data, source }. DB errors propagate.
async function getProgress(userId) {
  if (!isDbConnected()) {
    return { data: inMemoryProgress.get(userId) || getDefaultProgress(userId), source: 'memory' };
  }

  let progress = await Progress.findOne({ userId }).lean();

  if (!progress) {
    progress = getDefaultProgress(userId);
  } else {
    // Normalize Map objects if lean didn't convert them
    for (const key of ['learningPath', 'passagesProgress', 'passageAnswers']) {
      if (progress[key] instanceof Map) {
        progress[key] = Object.fromEntries(progress[key]);
      }
    }
  }
  return { data: progress, source: 'database' };
}

// `update` holds the fields to save (userId, only the fields the client sent,
// updatedAt). Returns { data, source }. DB errors propagate.
async function saveProgress(userId, update) {
  if (!isDbConnected()) {
    const existing = inMemoryProgress.get(userId) || getDefaultProgress(userId);
    const merged = {
      ...existing,
      ...update,
      learningPath: { ...existing.learningPath, ...(update.learningPath || {}) },
      passagesProgress: { ...existing.passagesProgress, ...(update.passagesProgress || {}) },
      passageAnswers: { ...existing.passageAnswers, ...(update.passageAnswers || {}) },
      settings: { ...existing.settings, ...(update.settings || {}) }
    };
    inMemoryProgress.set(userId, merged);
    return { data: merged, source: 'memory' };
  }

  const saved = await Progress.findOneAndUpdate(
    { userId },
    { $set: update },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();
  return { data: saved, source: 'database' };
}

module.exports = { getProgress, saveProgress, getDefaultProgress };
