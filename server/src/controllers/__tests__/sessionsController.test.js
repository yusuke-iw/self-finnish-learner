const sessionsController = require('../sessionsController');
const Sentence = require('../../models/Sentence');
const mongoose = require('mongoose');
const { compareAnswers } = require('../../utils/typoTolerance');

jest.mock('../../models/Sentence');
jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    connection: { readyState: 1 }
  };
});
jest.mock('../../utils/typoTolerance', () => ({
  compareAnswers: jest.fn()
}));

const mockSentences = [
  { _id: 's1', text: 'Minä puhun suomea.', translation: 'I speak Finnish.', category: 'basic' },
  { _id: 's2', text: 'Tämä on helppoa.', translation: 'This is easy.', category: 'basic' }
];

describe('Sessions Controller', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = { body: {} };
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('generateSession', () => {
    const spokenSentence = {
      ...mockSentences[0], spokenText: 'Mä puhun suomea.',
      spokenNotes: 'minä → mä', spokenNotesJa: 'minä → mä（私）'
    };

    it.each([
      ['speaking', null, 0.1, 'speaking'], ['dictation', null, 0.1, 'typing'],
      ['matching', null, 0.1, 'matching'], ['word-bank', null, 0.1, 'word-bank'],
      [undefined, 1, 0.1, 'choice'], [undefined, 1, 0.9, 'matching'],
      [undefined, 2, 0.1, 'word-bank'], [undefined, 2, 0.9, 'word-bank-reverse'],
      [undefined, 3, 0.1, 'typing'], [undefined, 3, 0.5, 'speaking'],
      [undefined, 3, 0.9, 'fill-in-the-blank']
    ])('includes spoken fields for exercise=%s level=%s random=%s type=%s', async (exerciseType, level, random, type) => {
      mockReq.body = { exerciseType, level, lang: 'en' };
      Sentence.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([spokenSentence]) });
      const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(random);
      try {
        await sessionsController.generateSession(mockReq, mockRes, mockNext);
      } finally {
        randomSpy.mockRestore();
      }
      const questions = mockRes.json.mock.calls[0][0].data.questions;
      expect(questions).toHaveLength(1);
      for (const question of questions) {
        expect(question).toMatchObject({
          type,
          spokenText: spokenSentence.spokenText,
          spokenNotes: spokenSentence.spokenNotes,
          spokenNotesJa: spokenSentence.spokenNotesJa
        });
      }
    });

    it('generates only spoken sentences and supplements short database distractor pools', async () => {
      mockReq.body = { exerciseType: 'spoken', category: 'basic', sentenceIds: ['s1'] };
      const extras = [mockSentences[1], { _id: 's3', text: 'Kolmas.' }, { _id: 's4', text: 'Neljäs.' }];
      Sentence.find.mockImplementation(query => ({ exec: jest.fn().mockResolvedValue(
        query._id ? [spokenSentence] : query.category ? [spokenSentence, mockSentences[1]] : [spokenSentence, ...extras]
      ) }));
      await sessionsController.generateSession(mockReq, mockRes, mockNext);
      const questions = mockRes.json.mock.calls[0][0].data.questions;
      expect(questions).toHaveLength(1);
      expect(questions[0]).toMatchObject({
        type: 'spoken-choice', level: 2, sentenceId: 's1',
        prompt: spokenSentence.spokenText, correctAnswer: spokenSentence.text
      });
      expect(new Set(questions[0].options)).toEqual(new Set([spokenSentence.text, ...extras.map(s => s.text)]));
    });

    it('uses only sentences whose spokenText differs from the written text', async () => {
      mockReq.body = { exerciseType: 'spoken', sentenceCount: 5 };
      const pool = [spokenSentence, ...mockSentences.slice(1),
        { _id: 's3', text: 'Kolmas.', spokenText: 'Kolmas.' }, { _id: 's4', text: 'Neljäs.' }];
      Sentence.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(pool) });
      await sessionsController.generateSession(mockReq, mockRes, mockNext);
      const questions = mockRes.json.mock.calls[0][0].data.questions;
      expect(questions.map(q => q.sentenceId)).toEqual(['s1']);
      expect(questions.every(q => q.type === 'spoken-choice' && q.options.length === 4)).toBe(true);
    });

    it('returns 400 when no sentences have spokenText', async () => {
      mockReq.body = { exerciseType: 'spoken' };
      Sentence.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockSentences) });
      await sessionsController.generateSession(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, error: 'No sentences found' });
    });

    it('uses memory fallback and respects sentenceIds for spoken practice', async () => {
      mongoose.connection.readyState = 0;
      mockReq.body = { exerciseType: 'spoken', category: 'Asiointi ja Matkustaminen', sentenceIds: ['m1_2'] };
      try {
        await sessionsController.generateSession(mockReq, mockRes, mockNext);
        const questions = mockRes.json.mock.calls[0][0].data.questions;
        expect(questions).toHaveLength(1);
        expect(questions[0]).toMatchObject({ sentenceId: 'm1_2', type: 'spoken-choice' });
        expect(questions[0].options).toHaveLength(4);
      } finally {
        mongoose.connection.readyState = 1;
      }
    });

    it('should return 400 if no sentences found', async () => {
      Sentence.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });
      await sessionsController.generateSession(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, error: 'No sentences found' });
    });

    it('should pass error to next middleware if DB fails', async () => {
      const error = new Error('DB Error');
      Sentence.find.mockReturnValue({ exec: jest.fn().mockRejectedValue(error) });
      await sessionsController.generateSession(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should generate session with explicit level 1', async () => {
      mockReq.body.level = 1;
      Sentence.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockSentences) });
      
      await sessionsController.generateSession(mockReq, mockRes, mockNext);
      
      expect(mockRes.json).toHaveBeenCalled();
      const responseBody = mockRes.json.mock.calls[0][0];
      expect(responseBody.success).toBe(true);
      expect(responseBody.data.questions.every(q => q.level === 1)).toBe(true);
    });

    it('should filter by category if provided', async () => {
      mockReq.body.category = 'basic';
      Sentence.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockSentences) });
      
      await sessionsController.generateSession(mockReq, mockRes, mockNext);
      
      expect(Sentence.find).toHaveBeenCalledWith({ category: 'basic' });
    });
    
    it('should handle exerciseType speaking', async () => {
      mockReq.body.exerciseType = 'speaking';
      Sentence.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockSentences) });
      
      await sessionsController.generateSession(mockReq, mockRes, mockNext);
      
      const responseBody = mockRes.json.mock.calls[0][0];
      expect(responseBody.data.questions.every(q => q.type === 'speaking')).toBe(true);
    });

    it('should handle exerciseType dictation by generating one level 3 typing listening question per sentence', async () => {
      mockReq.body.exerciseType = 'dictation';
      Sentence.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockSentences) });

      await sessionsController.generateSession(mockReq, mockRes, mockNext);

      const responseBody = mockRes.json.mock.calls[0][0];
      expect(responseBody.success).toBe(true);
      expect(responseBody.data.questions).toHaveLength(mockSentences.length);
      expect(
        responseBody.data.questions.every(
          q => q.level === 3 && q.type === 'typing' && q.isListening === true && Boolean(q.correctAnswer)
        )
      ).toBe(true);
    });
    
    it('should handle memory fallback', async () => {
      mongoose.connection.readyState = 0;
      mockReq.body.category = 'Asiointi ja Matkustaminen';
      await sessionsController.generateSession(mockReq, mockRes, mockNext);
      
      const responseBody = mockRes.json.mock.calls[0][0];
      expect(responseBody.data.source).toBe('memory');
      mongoose.connection.readyState = 1; // reset
    });

    it('should filter by sentenceIds in database mode and combine with category if provided', async () => {
      mockReq.body = { sentenceIds: ['s1', 's2'] };
      Sentence.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockSentences) });

      await sessionsController.generateSession(mockReq, mockRes, mockNext);
      expect(Sentence.find).toHaveBeenCalledWith({ _id: { $in: ['s1', 's2'] } });

      mockReq.body = { category: 'basic', sentenceIds: ['s1'] };
      await sessionsController.generateSession(mockReq, mockRes, mockNext);
      expect(Sentence.find).toHaveBeenCalledWith({ category: 'basic', _id: { $in: ['s1'] } });
    });

    it('should ignore sentenceIds if empty or not an array', async () => {
      mockReq.body = { sentenceIds: [] };
      Sentence.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockSentences) });

      await sessionsController.generateSession(mockReq, mockRes, mockNext);
      expect(Sentence.find).toHaveBeenCalledWith({});

      mockReq.body = { sentenceIds: 'not-an-array' };
      await sessionsController.generateSession(mockReq, mockRes, mockNext);
      expect(Sentence.find).toHaveBeenCalledWith({});
    });

    it('should filter by sentenceIds in memory mode', async () => {
      mongoose.connection.readyState = 0;
      mockReq.body = { sentenceIds: ['m1_1'], level: 3, exerciseType: 'speaking' };

      await sessionsController.generateSession(mockReq, mockRes, mockNext);

      const responseBody = mockRes.json.mock.calls[0][0];
      expect(responseBody.success).toBe(true);
      expect(responseBody.data.questions).toHaveLength(1);
      expect(responseBody.data.questions[0].sentenceId).toBe('m1_1');
      mongoose.connection.readyState = 1;
    });

    it('should draw choice distractors from outside sentenceIds when reviewing one sentence', async () => {
      mongoose.connection.readyState = 0;
      // Math.random() <= 0.5 makes the level 1 question a choice question, not matching
      const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.1);
      mockReq.body = { sentenceIds: ['m1_1'], level: 1 };

      try {
        await sessionsController.generateSession(mockReq, mockRes, mockNext);

        const responseBody = mockRes.json.mock.calls[0][0];
        const choice = responseBody.data.questions.find(q => q.type === 'choice');
        expect(choice.sentenceId).toBe('m1_1');
        expect(choice.options).toHaveLength(4);
      } finally {
        randomSpy.mockRestore();
        mongoose.connection.readyState = 1;
      }
    });
  });

  describe('checkAnswer', () => {
    it.each(['choice', 'spoken-choice'])('checks %s with exact equality and no typo tolerance', async (questionType) => {
      Sentence.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockSentences[0]) });
      for (const userInput of [mockSentences[0].text, 'Minä puhun suome.', 'minä puhun suomea.', 'Mä puhun suomea.']) {
        mockReq.body = { sentenceId: 's1', userInput, questionType };
        await sessionsController.checkAnswer(mockReq, mockRes, mockNext);
        const data = mockRes.json.mock.calls.at(-1)[0].data;
        expect(data).toMatchObject({
          isCorrect: userInput === mockSentences[0].text,
          isPerfect: userInput === mockSentences[0].text,
          hasTypo: false, correctText: mockSentences[0].text
        });
      }
      expect(compareAnswers).not.toHaveBeenCalled();
    });

    it('should return 400 if sentenceId is missing', async () => {
      await sessionsController.checkAnswer(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, error: 'sentenceId is required' });
    });

    it('should return 404 if sentence not found', async () => {
      mockReq.body = { sentenceId: 'nonexistent', userInput: 'test' };
      Sentence.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await sessionsController.checkAnswer(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, error: 'Sentence not found' });
    });

    it('should pass error to next middleware if DB fails', async () => {
      mockReq.body = { sentenceId: 's1', userInput: 'test' };
      const error = new Error('DB Error');
      Sentence.findById.mockReturnValue({ exec: jest.fn().mockRejectedValue(error) });

      await sessionsController.checkAnswer(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should check answer with word-bank-reverse', async () => {
      mockReq.body = { sentenceId: 's1', userInput: 'I speak Finnish.', questionType: 'word-bank-reverse' };
      Sentence.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockSentences[0]) });
      compareAnswers.mockReturnValue({ isCorrect: true, isPerfect: true, hasTypo: false });

      await sessionsController.checkAnswer(mockReq, mockRes, mockNext);

      expect(compareAnswers).toHaveBeenCalledWith('I speak Finnish.', 'I speak Finnish.');
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: { isCorrect: true, isPerfect: true, hasTypo: false, correctText: 'I speak Finnish.' },
        source: 'database'
      }));
    });

    it('should check answer with fill-in-the-blank', async () => {
      mockReq.body = { sentenceId: 's1', userInput: 'suomea', questionType: 'fill-in-the-blank', missingWord: 'suomea' };
      Sentence.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockSentences[0]) });
      compareAnswers.mockReturnValue({ isCorrect: true, isPerfect: true, hasTypo: false });

      await sessionsController.checkAnswer(mockReq, mockRes, mockNext);

      expect(compareAnswers).toHaveBeenCalledWith('suomea', 'suomea');
    });

    it('should handle memory fallback for checkAnswer', async () => {
      mongoose.connection.readyState = 0;
      mockReq.body = { sentenceId: 'm1_1', userInput: 'What time does the train leave for Tampere?' };
      compareAnswers.mockReturnValue({ isCorrect: true, isPerfect: true, hasTypo: false });

      await sessionsController.checkAnswer(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        source: 'memory'
      }));
      mongoose.connection.readyState = 1; // reset
    });
  });
});
