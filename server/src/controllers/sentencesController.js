const mongoose = require('mongoose');
const Sentence = require('../models/Sentence');
const { sentences } = require('../config/seedData');

exports.getSentences = async (req, res) => {
  try {
    // Without a DB connection, Mongoose buffers the query for 10 s before failing, so skip it
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }
    const dbSentences = await Sentence.find().exec();
    // If model returns data, respond with it; otherwise fallback
    if (Array.isArray(dbSentences) && dbSentences.length > 0) {
      return res.json({ success: true, data: dbSentences, source: 'database' });
    }
    // Fallback to in-memory seed data
    return res.json({ success: true, data: sentences, source: 'memory' });
  } catch (error) {
    // On any error, fallback to memory data
    return res.json({ success: true, data: sentences, source: 'memory' });
  }
};
