const Progress = require('../../models/Progress');
const mongoose = require('mongoose');

jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    connection: { readyState: 1 }
  };
});

const progressController = require('../progressController');

describe('Progress Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      query: {},
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
    mongoose.connection.readyState = 1;
  });

  describe('getProgress', () => {
    it('should return default progress when no record exists', async () => {
      jest.spyOn(Progress, 'findOne').mockReturnValue({
        lean: jest.fn().mockResolvedValue(null)
      });

      await progressController.getProgress(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          userId: 'default_user',
          learningPath: expect.any(Object),
          passagesProgress: expect.any(Object),
          passageAnswers: expect.any(Object),
          mistakes: expect.any(Array),
          settings: expect.any(Object)
        })
      }));
    });

    it('should return found progress when record exists', async () => {
      const mockRecord = {
        userId: 'default_user',
        learningPath: { 'Ruoka ja Juoma': 3 },
        passagesProgress: { 'p1': true },
        passageAnswers: { 'p1': { 0: 'A' } },
        mistakes: [],
        settings: { language: 'fi' }
      };

      jest.spyOn(Progress, 'findOne').mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockRecord)
      });

      await progressController.getProgress(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockRecord,
        source: expect.any(String)
      });
    });
  });

  describe('saveProgress', () => {
    it('should upsert and return updated progress', async () => {
      const payload = {
        userId: 'default_user',
        learningPath: { 'Ruoka ja Juoma': 4 },
        passagesProgress: { 'p1': true },
        passageAnswers: { 'p1': { 0: 'B' } },
        mistakes: [{ question: 'Test' }],
        settings: { language: 'en' }
      };
      req.body = payload;

      jest.spyOn(Progress, 'findOneAndUpdate').mockReturnValue({
        lean: jest.fn().mockResolvedValue(payload)
      });

      await progressController.saveProgress(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining(payload)
      }));
    });
  });
});
