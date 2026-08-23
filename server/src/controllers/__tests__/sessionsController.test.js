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
    
    it('should handle memory fallback', async () => {
      mongoose.connection.readyState = 0;
      mockReq.body.category = 'Asiointi ja Matkustaminen';
      await sessionsController.generateSession(mockReq, mockRes, mockNext);
      
      const responseBody = mockRes.json.mock.calls[0][0];
      expect(responseBody.data.source).toBe('memory');
      mongoose.connection.readyState = 1; // reset
    });
  });

  describe('checkAnswer', () => {
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
