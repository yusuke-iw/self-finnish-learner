const mongoose = require('mongoose');
const Sentence = require('../Sentence');
const ReadingPassage = require('../ReadingPassage');

describe('Sentence Model Validation', () => {
  test('should fail validation if required fields are missing', () => {
    const sentence = new Sentence({});
    const err = sentence.validateSync();
    expect(err.errors.text).toBeDefined();
    expect(err.errors.translation).toBeDefined();
  });

  test('should validate successfully with correct fields', () => {
    const sentence = new Sentence({
      text: 'Minä puhun suomea.',
      translation: 'I speak Finnish.',
      difficulty: 'easy',
      category: 'basic'
    });
    const err = sentence.validateSync();
    expect(err).toBeUndefined();
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
  });
});
