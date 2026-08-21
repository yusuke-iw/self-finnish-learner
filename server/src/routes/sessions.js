const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Sentence = require('../models/Sentence');
const { sentences } = require('../config/seedData');
const { compareAnswers } = require('../utils/typoTolerance');

const vocabularyBank = [
  { fi: 'Kissa', en: 'Cat' },
  { fi: 'Koira', en: 'Dog' },
  { fi: 'Talo', en: 'House' },
  { fi: 'Auto', en: 'Car' },
  { fi: 'Kirja', en: 'Book' },
  { fi: 'Mies', en: 'Man' },
  { fi: 'Nainen', en: 'Woman' },
  { fi: 'Poika', en: 'Boy' },
  { fi: 'Tyttö', en: 'Girl' },
  { fi: 'Vesi', en: 'Water' },
  { fi: 'Kahvi', en: 'Coffee' },
  { fi: 'Leipä', en: 'Bread' },
  { fi: 'Maito', en: 'Milk' },
  { fi: 'Omena', en: 'Apple' },
  { fi: 'Kyllä', en: 'Yes' },
  { fi: 'Ei', en: 'No' },
  { fi: 'Kiitos', en: 'Thank you' },
  { fi: 'Yksi', en: 'One' },
  { fi: 'Kaksi', en: 'Two' },
  { fi: 'Kolme', en: 'Three' }
];

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
    const requestedLevel = req.body.level ? Number(req.body.level) : null;

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
      // Level 1: Choice Question or Matching Pairs
      if (!requestedLevel || requestedLevel === 1) {
        const isMatching = Math.random() > 0.5;

        if (isMatching) {
          // Generate Matching Pairs
          const selectedVocab = shuffle([...vocabularyBank]).slice(0, 5);
          const pairs = selectedVocab.map(v => ({ id: Math.random().toString(36).substring(7), ...v }));
          
          let tokens = [];
          pairs.forEach(p => {
            tokens.push({ id: p.id, text: p.fi, lang: 'fi' });
            tokens.push({ id: p.id, text: p.en, lang: 'en' });
          });
          tokens = shuffle(tokens);

          level1Questions.push({
            sentenceId: 'matching-warmup-' + Math.random(),
            level: 1,
            type: 'matching',
            tokens,
            pairs
          });
        } else {
          // Choice Question
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
        }
      }

      // Level 2: Word Bank Question
      if (!requestedLevel || requestedLevel === 2) {
        const wrongSentences = availableSentences.filter(s => s._id.toString() !== sentence._id.toString());
        const isReverse = Math.random() > 0.5;

        if (!isReverse) {
          // Standard: Finnish word bank, English prompt
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
        } else {
          // Reverse: English word bank, Finnish prompt
          const cleanWords = sentence.translation
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 0);
          
          const distractors = [];
          if (wrongSentences.length > 0) {
            const randomWrongText = wrongSentences[Math.floor(Math.random() * wrongSentences.length)].translation;
            const randomWrongWords = randomWrongText.split(/\s+/).filter(w => w.length > 2);
            if (randomWrongWords.length > 0) {
              distractors.push(randomWrongWords[Math.floor(Math.random() * randomWrongWords.length)]);
            }
          }

          const wordBank = shuffle([...cleanWords, ...distractors]);

          level2Questions.push({
            sentenceId: sentence._id.toString(),
            level: 2,
            type: 'word-bank-reverse',
            prompt: sentence.text,
            correctAnswer: sentence.translation,
            wordBank
          });
        }
      }

      // Level 3: Typing, Fill in the Blank, or Speaking
      if (!requestedLevel || requestedLevel === 3) {
        const rand = Math.random();
        
        if (rand > 0.66) {
          // 33% chance: Fill in the blank
          const words = sentence.text.split(' ');
          // Try to pick a word longer than 2 chars if possible
          const candidateWords = words.filter(w => w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '').length > 2);
          const targetWordRaw = candidateWords.length > 0 
            ? candidateWords[Math.floor(Math.random() * candidateWords.length)]
            : words[Math.floor(Math.random() * words.length)];
          
          // Strip punctuation from target word for the missing piece
          const missingWord = targetWordRaw.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '');
          
          // Use regex to find the word to keep punctuation in prefix/suffix
          const matchIndex = sentence.text.indexOf(missingWord);
          const prefix = sentence.text.substring(0, matchIndex);
          const suffix = sentence.text.substring(matchIndex + missingWord.length);

          level3Questions.push({
            sentenceId: sentence._id.toString(),
            level: 3,
            type: 'fill-in-the-blank',
            prompt: sentence.translation,
            prefix,
            missingWord,
            suffix,
            correctAnswer: sentence.text, // the full text just in case, but checked via missingWord
            isListening: Math.random() > 0.5
          });
        } else if (rand > 0.33) {
          // 33% chance: Speaking Practice
          level3Questions.push({
            sentenceId: sentence._id.toString(),
            level: 3,
            type: 'speaking',
            prompt: sentence.text,
            correctAnswer: sentence.text
          });
        } else {
          // 33% chance: Typing
          level3Questions.push({
            sentenceId: sentence._id.toString(),
            level: 3,
            type: 'typing',
            prompt: sentence.translation,
            correctAnswer: sentence.text,
            isListening: Math.random() > 0.5
          });
        }
      }
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
    const { sentenceId, userInput, questionType, missingWord } = req.body;

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

    // Determine what to compare against based on question type
    let targetText = sentence.text;
    if (questionType === 'word-bank-reverse') {
      targetText = sentence.translation;
    } else if (questionType === 'fill-in-the-blank' && missingWord) {
      // Security check: make sure the missingWord actually exists in the sentence
      if (sentence.text.includes(missingWord)) {
        targetText = missingWord;
      }
    }

    const result = compareAnswers(userInput, targetText);

    res.json({
      success: true,
      data: {
        isCorrect: result.isCorrect,
        isPerfect: result.isPerfect,
        hasTypo: result.hasTypo,
        correctText: targetText
      },
      source: mongoose.connection.readyState !== 1 ? 'memory' : 'database'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
