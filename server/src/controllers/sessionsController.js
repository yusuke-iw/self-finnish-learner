const { compareAnswers } = require('../utils/typoTolerance');
const { shuffle } = require('../utils/shuffle');
const { currentSource } = require('../data/connection');
const { findSentenceById, findSessionSentences, findAllSentences } = require('../data/sentencesData');
const { buildQuestions } = require('../services/questionBuilders');

// POST /api/sessions/generate
exports.generateSession = async (req, res, next) => {
  try {
    const sentenceCount = (req.body && req.body.sentenceCount) || 3;
    const category = req.body && req.body.category;
    const requestedLevel = req.body && req.body.level ? Number(req.body.level) : null;
    const exerciseType = req.body && req.body.exerciseType;
    const lang = (req.body && req.body.lang) || (req.query && req.query.lang) || 'ja';
    const rawSentenceIds = req.body && req.body.sentenceIds;
    const sentenceIds = Array.isArray(rawSentenceIds)
      ? rawSentenceIds.filter(id => typeof id === 'string' && id.trim().length > 0)
      : [];

    let { availableSentences, distractorPool } = await findSessionSentences({ category, sentenceIds });

    if (exerciseType === 'spoken') {
      // Only sentences that change in speech make a real spoken-to-written question
      availableSentences = availableSentences.filter(sentence => sentence.spokenText && sentence.spokenText !== sentence.text);
    }

    if (availableSentences.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No sentences found'
      });
    }

    let extraDistractors = [];
    if (exerciseType === 'spoken' && new Set(distractorPool.map(s => s.text)).size < 4) {
      extraDistractors = await findAllSentences();
    }

    // Select random sentences up to sentenceCount
    const selectedSentences = shuffle(availableSentences).slice(0, sentenceCount);

    const questions = buildQuestions(selectedSentences, {
      exerciseType, requestedLevel, lang, category, distractorPool, extraDistractors
    });

    res.json({
      success: true,
      data: {
        sessionId: Math.random().toString(36).substring(2, 9),
        questions,
        source: currentSource()
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/sessions/check
exports.checkAnswer = async (req, res, next) => {
  try {
    const { sentenceId, userInput, questionType, missingWord, lang } = req.body;

    if (!sentenceId) {
      return res.status(400).json({
        success: false,
        error: 'sentenceId is required'
      });
    }

    const sentence = await findSentenceById(sentenceId);

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
      if (sentence.text.includes(missingWord)) {
        targetText = missingWord;
      }
    }

    const isChoice = questionType === 'choice' || questionType === 'spoken-choice';
    const result = isChoice
      ? { isCorrect: userInput === targetText, isPerfect: userInput === targetText, hasTypo: false }
      : compareAnswers(userInput, targetText);

    const isJa = lang === 'ja';
    const translationOut = (isJa && sentence.translationJa) ? sentence.translationJa : sentence.translation;
    const notesOut = (isJa && sentence.grammarNotesJa) ? sentence.grammarNotesJa : sentence.grammarNotes;

    res.json({
      success: true,
      data: {
        isCorrect: result.isCorrect,
        isPerfect: result.isPerfect,
        hasTypo: result.hasTypo,
        correctText: targetText
      },
      source: currentSource()
    });
  } catch (error) {
    next(error);
  }
};
