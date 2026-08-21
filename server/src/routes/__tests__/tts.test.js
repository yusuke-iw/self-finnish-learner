const request = require('supertest');
const express = require('express');
const ttsRoute = require('../tts');

const app = express();
app.use(express.json());
app.use('/api/tts', ttsRoute);

describe('TTS Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterAll(() => {
    delete global.fetch;
  });

  it('should return 400 if text is missing', async () => {
    process.env.GOOGLE_TTS_API_KEY = 'test-key';
    const res = await request(app).post('/api/tts').send({});
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toBe('Text is required.');
  });

  it('should proxy successful TTS request', async () => {
    process.env.GOOGLE_TTS_API_KEY = 'test-key';
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ audioContent: 'base64-audio-string' })
    });

    const res = await request(app)
      .post('/api/tts')
      .send({ text: 'Terve', speed: 1.0 });

    expect(res.statusCode).toEqual(200);
    expect(res.body.audioContent).toBe('base64-audio-string');
    
    // Verify fetch was called with the right params
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://texttospeech.googleapis.com/v1/text:synthesize'),
      expect.objectContaining({
        body: expect.stringContaining('"text":"Terve"')
      })
    );
  });
});
