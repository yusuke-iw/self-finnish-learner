const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Sentence = require('../models/Sentence');
const { sentences } = require('../config/seedData');
const { compareAnswers } = require('../utils/typoTolerance');

// Helper to shuffle an array
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// POST /api/sessions/generate
router.post('/generate', async (req, res, next) => {
  try {
    const sentenceCount = req.body.sentenceCount || 3;
    const category = req.body.category;

    let availableSentences = [];

    // Fallback switch
    if (mongoose.connection.readyState !== 1) {
      availableSentences = sentences;
      if (category) {
        availableSentences = sentences.filter(s => s.category === category);
      }
    } else {
      let query = {};
      if (category) {
        query.category = category;
      }
      availableSentences = await Sentence.find(query).exec();
    }

    if (availableSentences.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No sentences found'
      });
    }

    // Select random sentences up to sentenceCount
    const selectedSentences = shuffle(availableSentences).slice(0, sentenceCount);

    const level1Questions = [];
    const level2Questions = [];
    const level3Questions = [];

    selectedSentences.forEach((sentence) => {
      // Level 1: Choice Question
      const wrongSentences = availableSentences.filter(s => s._id.toString() !== sentence._id.toString());
      const wrongOptions = shuffle(wrongSentences)
        .slice(0, 3)
        .map(s => s.text);
      const options = shuffle([sentence.text, ...wrongOptions]);

      level1Questions.push({
        sentenceId: sentence._id.toString(),
        level: 1,
        type: 'choice',
        prompt: sentence.translation,
        correctAnswer: sentence.text,
        options
      });

      // Level 2: Word Bank Question
      const cleanWords = sentence.text
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 0);
      
      const distractors = [];
      if (wrongSentences.length > 0) {
        const randomWrongText = wrongSentences[Math.floor(Math.random() * wrongSentences.length)].text;
        const randomWrongWords = randomWrongText.split(/\s+/).filter(w => w.length > 2);
        if (randomWrongWords.length > 0) {
          distractors.push(randomWrongWords[Math.floor(Math.random() * randomWrongWords.length)]);
        }
      }

      const wordBank = shuffle([...cleanWords, ...distractors]);

      level2Questions.push({
        sentenceId: sentence._id.toString(),
        level: 2,
        type: 'word-bank',
        prompt: sentence.translation,
        correctAnswer: sentence.text,
        wordBank
      });

      // Level 3: Typing Question
      level3Questions.push({
        sentenceId: sentence._id.toString(),
        level: 3,
        type: 'typing',
        prompt: sentence.translation,
        correctAnswer: sentence.text
      });
    });

    const questions = [
      ...level1Questions,
      ...level2Questions,
      ...level3Questions
    ];

    res.json({
      success: true,
      data: {
        sessionId: Math.random().toString(36).substring(2, 9),
        questions,
        source: mongoose.connection.readyState !== 1 ? 'memory' : 'database'
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/sessions/check
router.post('/check', async (req, res, next) => {
  try {
    const { sentenceId, userInput } = req.body;

    if (!sentenceId) {
      return res.status(400).json({
        success: false,
        error: 'sentenceId is required'
      });
    }

    let sentence = null;

    if (mongoose.connection.readyState !== 1) {
      sentence = sentences.find(s => s._id.toString() === sentenceId.toString());
    } else {
      sentence = await Sentence.findById(sentenceId).exec();
    }

    if (!sentence) {
      return res.status(404).json({
        success: false,
        error: 'Sentence not found'
      });
    }

    const result = compareAnswers(userInput, sentence.text);

    res.json({
      success: true,
      data: {
        isCorrect: result.isCorrect,
        isPerfect: result.isPerfect,
        hasTypo: result.hasTypo,
        correctText: sentence.text
      },
      source: mongoose.connection.readyState !== 1 ? 'memory' : 'database'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
