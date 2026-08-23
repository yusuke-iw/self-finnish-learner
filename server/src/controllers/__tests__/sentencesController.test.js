const sentencesController = require('../sentencesController');
const Sentence = require('../../models/Sentence');
const { sentences: memorySentences } = require('../../config/seedData');

jest.mock('../../models/Sentence');

describe('Sentences Controller', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = { params: {} };
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('getSentences', () => {
    it('should return sentences from DB', async () => {
      const mockData = [{ _id: 's1', text: 'Hello' }];
      const execMock = jest.fn().mockResolvedValue(mockData);
      Sentence.find.mockReturnValue({ exec: execMock });

      await sentencesController.getSentences(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: mockData, source: 'database' });
    });

    it('should fallback to memory if DB returns empty', async () => {
      const execMock = jest.fn().mockResolvedValue([]);
      Sentence.find.mockReturnValue({ exec: execMock });

      await sentencesController.getSentences(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, source: 'memory' })
      );
    });

    it('should fallback to memory on DB error', async () => {
      const execMock = jest.fn().mockRejectedValue(new Error('DB Error'));
      Sentence.find.mockReturnValue({ exec: execMock });

      await sentencesController.getSentences(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, source: 'memory' })
      );
    });
  });
});
