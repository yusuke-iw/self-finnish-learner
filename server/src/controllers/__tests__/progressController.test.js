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
    it('should normalize Map instances if present in record', async () => {
      const mockRecordWithMaps = {
        userId: 'user_with_maps',
        learningPath: new Map([['Food', 2]]),
        passagesProgress: new Map([['p1', true]]),
        passageAnswers: new Map([['p1', { 0: 'B' }]]),
        mistakes: [],
        settings: { language: 'en' }
      };

      jest.spyOn(Progress, 'findOne').mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockRecordWithMaps)
      });

      req.query.userId = 'user_with_maps';
      await progressController.getProgress(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          userId: 'user_with_maps',
          learningPath: { Food: 2 },
          passagesProgress: { p1: true },
          passageAnswers: { p1: { 0: 'B' } }
        }),
        source: 'database'
      }));
    });

    it('should fallback to in-memory storage when MongoDB is not connected', async () => {
      mongoose.connection.readyState = 0; // disconnected

      req.query.userId = 'memory_user_1';
      await progressController.getProgress(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          userId: 'memory_user_1',
          learningPath: expect.any(Object),
          settings: expect.objectContaining({ language: 'ja' })
        }),
        source: 'memory'
      }));
    });

    it('should handle errors and call next middleware', async () => {
      const mockError = new Error('Database connection failed');
      jest.spyOn(Progress, 'findOne').mockImplementation(() => {
        throw mockError;
      });

      const next = jest.fn();
      await progressController.getProgress(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe('saveProgress', () => {
    it('should upsert and return updated progress in database mode', async () => {
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
        data: expect.objectContaining(payload),
        source: 'database'
      }));
    });

    it('should fallback to in-memory storage and merge updates when MongoDB is disconnected', async () => {
      mongoose.connection.readyState = 0; // disconnected

      const initialPayload = {
        userId: 'offline_user',
        learningPath: { 'Unit 1': 2 },
        passagesProgress: { p1: true },
        settings: { language: 'ja' }
      };
      req.body = initialPayload;

      await progressController.saveProgress(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          userId: 'offline_user',
          learningPath: { 'Unit 1': 2 }
        }),
        source: 'memory'
      }));

      // Now save a subsequent update that merges with the existing record
      const updatePayload = {
        userId: 'offline_user',
        learningPath: { 'Unit 2': 1 },
        mistakes: [{ question: 'Mistake 1' }],
        settings: { language: 'en' }
      };
      req.body = updatePayload;

      await progressController.saveProgress(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          userId: 'offline_user',
          learningPath: { 'Unit 1': 2, 'Unit 2': 1 },
          mistakes: [{ question: 'Mistake 1' }],
          settings: { language: 'en' }
        }),
        source: 'memory'
      }));
    });

    it('should handle errors and call next middleware', async () => {
      const mockError = new Error('Database write error');
      jest.spyOn(Progress, 'findOneAndUpdate').mockImplementation(() => {
        throw mockError;
      });

      const next = jest.fn();
      await progressController.saveProgress(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });
});

