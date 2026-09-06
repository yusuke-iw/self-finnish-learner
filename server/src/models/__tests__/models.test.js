const mongoose = require('mongoose');
const Sentence = require('../Sentence');
const ReadingPassage = require('../ReadingPassage');
const Progress = require('../Progress');

describe('Sentence Model Validation', () => {
  test('should fail validation if required fields are missing', () => {
    const sentence = new Sentence({});
    const err = sentence.validateSync();
    expect(err.errors.text).toBeDefined();
    expect(err.errors.translation).toBeDefined();
  });

  test('should validate successfully with correct fields', () => {
    const sentence = new Sentence({
      _id: 'custom_s_1',
      text: 'Minä puhun suomea.',
      translation: 'I speak Finnish.',
      difficulty: 'easy',
      category: 'basic'
    });
    const err = sentence.validateSync();
    expect(err).toBeUndefined();
    expect(sentence._id).toBe('custom_s_1');
  });
});

describe('ReadingPassage Model Validation', () => {
  test('should fail validation if required fields are missing', () => {
    const passage = new ReadingPassage({});
    const err = passage.validateSync();
    expect(err.errors.title).toBeDefined();
    expect(err.errors.text).toBeDefined();
  });

  test('should validate successfully with correct structure', () => {
    const passage = new ReadingPassage({
      _id: 'p1',
      title: 'Tervehdys',
      text: 'Hei, minä olen Pekka. Asun Helsingissä.',
      translation: 'Hi, I am Pekka. I live in Helsinki.',
      vocabulary: [{ word: 'asun', translation: 'I live' }],
      questions: [{
        questionText: 'Missä Pekka asuu?',
        options: ['Helsingissä', 'Tampereella'],
        correctAnswerIndex: 0
      }]
    });
    const err = passage.validateSync();
    expect(err).toBeUndefined();
    expect(passage._id).toBe('p1');
  });
});

describe('Progress Model Validation', () => {
  test('should validate successfully with default values', () => {
    const progress = new Progress({});
    const err = progress.validateSync();
    expect(err).toBeUndefined();
    expect(progress.userId).toBe('default_user');
  });

  test('should validate with custom data structure', () => {
    const progress = new Progress({
      userId: 'user-123',
      learningPath: { 'Ruoka ja Juoma': 2 },
      passagesProgress: { 'p1': true },
      passageAnswers: { 'p1': { 0: 'A' } },
      mistakes: [{ question: 'Kissa on...', answer: 'kissa' }],
      settings: { language: 'ja' }
    });
    const err = progress.validateSync();
    expect(err).toBeUndefined();
    expect(progress.learningPath.get('Ruoka ja Juoma') || progress.learningPath['Ruoka ja Juoma']).toBe(2);
  });
});

