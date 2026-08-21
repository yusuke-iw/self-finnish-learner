const express = require('express');
const router = express.Router();
const Sentence = require('../models/Sentence');
const { sentences } = require('../config/seedData');

// Get all sentences - use model if available, fallback to memory on error
router.get('/', async (req, res) => {
  try {
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
});

module.exports = router;
