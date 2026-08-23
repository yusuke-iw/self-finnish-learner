const passagesController = require('../passagesController');
const ReadingPassage = require('../../models/ReadingPassage');
const { passages: memoryPassages } = require('../../config/seedData');

jest.mock('../../models/ReadingPassage');

describe('Passages Controller', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      params: {}
    };
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('getPassages', () => {
    it('should return passages from database including difficulty', async () => {
      const mockDbPassages = [
        { _id: '1', title: 'Test 1', translation: 'Trans 1', category: 'Cat 1', difficulty: 'A1' }
      ];
      
      const execMock = jest.fn().mockResolvedValue(mockDbPassages);
      const selectMock = jest.fn().mockReturnValue({ exec: execMock });
      ReadingPassage.find.mockReturnValue({ select: selectMock });

      await passagesController.getPassages(mockReq, mockRes);

      expect(selectMock).toHaveBeenCalledWith('title translation category difficulty');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockDbPassages,
        source: 'database'
      });
    });

    it('should fallback to memory if database is empty', async () => {
      const execMock = jest.fn().mockResolvedValue([]);
      const selectMock = jest.fn().mockReturnValue({ exec: execMock });
      ReadingPassage.find.mockReturnValue({ select: selectMock });

      await passagesController.getPassages(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Array),
        source: 'memory'
      });
      // Ensure difficulty is in the memory fallback
      expect(mockRes.json.mock.calls[0][0].data[0]).toHaveProperty('difficulty');
    });

    it('should fallback to memory on database error', async () => {
      const execMock = jest.fn().mockRejectedValue(new Error('DB Error'));
      const selectMock = jest.fn().mockReturnValue({ exec: execMock });
      ReadingPassage.find.mockReturnValue({ select: selectMock });

      await passagesController.getPassages(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Array),
        source: 'memory'
      });
    });
  });

  describe('getPassageById', () => {
    it('should return passage from database by ID', async () => {
      const mockDbPassage = { _id: 'p1', title: 'Test 1' };
      mockReq.params.id = 'p1';
      
      ReadingPassage.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDbPassage)
      });

      await passagesController.getPassageById(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockDbPassage,
        source: 'database'
      });
    });

    it('should fallback to memory if not found in database', async () => {
      mockReq.params.id = 'p1';
      
      ReadingPassage.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      });

      await passagesController.getPassageById(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({ _id: 'p1' }),
        source: 'memory'
      });
    });

    it('should return 404 if not found in database or memory', async () => {
      mockReq.params.id = 'nonexistent';
      
      ReadingPassage.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      });

      await passagesController.getPassageById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Reading passage not found'
      });
    });
  });
});
