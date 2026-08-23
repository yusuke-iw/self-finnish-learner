const ttsController = require('../ttsController');

describe('TTS Controller', () => {
  let mockReq;
  let mockRes;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    mockReq = {
      body: {}
    };
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    global.fetch = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('synthesize', () => {
    it('should return 500 if API key is missing', async () => {
      delete process.env.GOOGLE_TTS_API_KEY;
      await ttsController.synthesize(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, error: 'Google TTS API key not configured on server.' });
    });

    it('should return 400 if text is missing', async () => {
      process.env.GOOGLE_TTS_API_KEY = 'test-key';
      await ttsController.synthesize(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, error: 'Text is required.' });
    });

    it('should return audio content on success', async () => {
      process.env.GOOGLE_TTS_API_KEY = 'test-key';
      mockReq.body.text = 'Hei';
      
      const mockApiResponse = { audioContent: 'base64audio' };
      global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockApiResponse)
      });

      await ttsController.synthesize(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ success: true, audioContent: 'base64audio' });
    });

    it('should return 500 if API responds with error', async () => {
      process.env.GOOGLE_TTS_API_KEY = 'test-key';
      mockReq.body.text = 'Hei';
      
      const mockApiResponse = { error: { message: 'Invalid API key' } };
      global.fetch.mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue(mockApiResponse)
      });

      await ttsController.synthesize(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, error: 'Invalid API key' });
    });

    it('should return 500 on fetch throw', async () => {
      process.env.GOOGLE_TTS_API_KEY = 'test-key';
      mockReq.body.text = 'Hei';
      
      global.fetch.mockRejectedValue(new Error('Network failure'));

      await ttsController.synthesize(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, error: 'Internal server error while fetching TTS' });
    });
  });
});
