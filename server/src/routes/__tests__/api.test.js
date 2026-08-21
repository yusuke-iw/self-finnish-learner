const request = require('supertest');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Mock mongoose connection state so routes use mocked models instead of seed-data fallback
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    connection: { readyState: 1 }
  };
});

// Mock Mongoose Models
jest.mock('../../models/Sentence', () => {
  return {
    find: jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue([
        { _id: 's1', text: 'Minä puhun suomea.', translation: 'I speak Finnish.', difficulty: 'easy', category: 'basic' },
        { _id: 's2', text: 'Tämä on helppoa.', translation: 'This is easy.', difficulty: 'easy', category: 'basic' }
      ])
    })),
    findById: jest.fn().mockImplementation((id) => ({
      exec: jest.fn().mockResolvedValue(
        id === 's1'
          ? { _id: 's1', text: 'Minä puhun suomea.', translation: 'I speak Finnish.', difficulty: 'easy', category: 'basic' }
          : { _id: 's2', text: 'Tämä on helppoa.', translation: 'This is easy.', difficulty: 'easy', category: 'basic' }
      )
    }))
  };
});

jest.mock('../../models/ReadingPassage', () => {
  return {
    find: jest.fn().mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([
        { _id: 'p1', title: 'Helsinki', text: 'Helsinki on pääkaupunki.', translation: 'Helsinki is the capital.' }
      ])
    })),
    findById: jest.fn().mockImplementation((id) => ({
      exec: jest.fn().mockResolvedValue({
        _id: 'p1',
        title: 'Helsinki',
        text: 'Helsinki on pääkaupunki.',
        translation: 'Helsinki is the capital.',
        vocabulary: [{ word: 'pääkaupunki', translation: 'capital' }],
        questions: [{ questionText: 'Mikä Helsinki on?', options: ['Pääkaupunki', 'Kylä'], correctAnswerIndex: 0 }]
      })
    }))
  };
});

// Setup Express App for Testing
const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes to be implemented
const sentencesRouter = require('../sentences');
const passagesRouter = require('../passages');
const sessionsRouter = require('../sessions');

app.use('/api/sentences', sentencesRouter);
app.use('/api/passages', passagesRouter);
app.use('/api/sessions', sessionsRouter);

// Global Error Handler Mock
app.use((err, req, res, next) => {
  res.status(500).json({ success: false, error: err.message });
});

describe('API Routes Tests', () => {
  
  describe('GET /api/sentences', () => {
    test('should fetch all sentences', async () => {
      const res = await request(app).get('/api/sentences');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data[0].text).toBe('Minä puhun suomea.');
    });
  });

  describe('GET /api/passages', () => {
    test('should fetch all passages', async () => {
      const res = await request(app).get('/api/passages');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data[0].title).toBe('Helsinki');
    });
  });

  describe('POST /api/sessions/generate', () => {
    test('should generate Duolingo-style scaffolded quiz session', async () => {
      const res = await request(app)
        .post('/api/sessions/generate')
        .send({ sentenceCount: 2 });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      // 2 sentences should generate 6 questions (2 sentences * 3 levels each)
      expect(res.body.data.questions.length).toBe(6);
      
      // Verify scaffolding: Level 1 (choice) should come before Level 3 (typing) for a sentence
      const questions = res.body.data.questions;
      
      // Find levels of sentence s1
      const s1Levels = questions
        .filter(q => q.sentenceId === 's1')
        .map(q => q.level);
      
      expect(s1Levels).toEqual([1, 2, 3]);
    });
  });

  describe('POST /api/sessions/check', () => {
    test('should validate correct answer without typos', async () => {
      const res = await request(app)
        .post('/api/sessions/check')
        .send({
          sentenceId: 's1',
          userInput: 'Minä puhun suomea.'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isCorrect).toBe(true);
      expect(res.body.data.isPerfect).toBe(true);
    });

    test('should validate correct answer with typos', async () => {
      const res = await request(app)
        .post('/api/sessions/check')
        .send({
          sentenceId: 's1',
          userInput: 'minä puhun suomaa' // edit distance 1 (o -> a)
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isCorrect).toBe(true);
      expect(res.body.data.isPerfect).toBe(false);
      expect(res.body.data.hasTypo).toBe(true);
    });

    test('should invalidate wrong answer', async () => {
      const res = await request(app)
        .post('/api/sessions/check')
        .send({
          sentenceId: 's1',
          userInput: 'Moi'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isCorrect).toBe(false);
    });
  });
});
