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

    it('should return 400 when userId is invalid in getProgress', async () => {
      req.query.userId = 'invalid user!';
      await progressController.getProgress(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String)
      });
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

    it('should return 400 when userId is invalid in saveProgress', async () => {
      req.body = {
        userId: 'invalid@user!',
        learningPath: { l1: 2 }
      };
      await progressController.saveProgress(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String)
      });
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

    it('should save and return sentenceMistakes in database and memory modes', async () => {
      const sentenceMistakes = [
        { sentenceId: 'm1_1', count: 2, lastMistakeAt: '2026-05-01T10:00:00.000Z' }
      ];
      req.body = {
        userId: 'mistake_user',
        sentenceMistakes
      };

      jest.spyOn(Progress, 'findOneAndUpdate').mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          userId: 'mistake_user',
          sentenceMistakes
        })
      });

      await progressController.saveProgress(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          userId: 'mistake_user',
          sentenceMistakes
        }),
        source: 'database'
      }));

      // Memory mode
      mongoose.connection.readyState = 0;
      req.body = {
        userId: 'mistake_mem_user',
        sentenceMistakes
      };
      await progressController.saveProgress(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          userId: 'mistake_mem_user',
          sentenceMistakes
        }),
        source: 'memory'
      }));
    });

    it('should save and return reviewSchedule and studyStats in database and memory modes', async () => {
      const reviewSchedule = {
        'sentence:s1': {
          box: 2,
          dueAt: '2026-05-05T00:00:00.000Z',
          lastReviewedAt: '2026-05-02T00:00:00.000Z',
          lapses: 1
        }
      };
      const studyStats = {
        days: { '2026-05-02': 12 },
        dailyGoal: 30
      };

      req.body = {
        userId: 'srs_user',
        reviewSchedule,
        studyStats
      };

      jest.spyOn(Progress, 'findOneAndUpdate').mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          userId: 'srs_user',
          reviewSchedule,
          studyStats
        })
      });

      await progressController.saveProgress(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          userId: 'srs_user',
          reviewSchedule,
          studyStats
        }),
        source: 'database'
      }));

      // Memory mode save and subsequent getProgress
      mongoose.connection.readyState = 0;
      req.body = {
        userId: 'srs_mem_user',
        reviewSchedule,
        studyStats
      };
      await progressController.saveProgress(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          userId: 'srs_mem_user',
          reviewSchedule,
          studyStats
        }),
        source: 'memory'
      }));

      res.json.mockClear();
      req.query = { userId: 'srs_mem_user' };
      await progressController.getProgress(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          userId: 'srs_mem_user',
          reviewSchedule,
          studyStats
        }),
        source: 'memory'
      }));
    });
  });
});

