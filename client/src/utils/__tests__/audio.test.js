import { playAudio } from '../audio';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('audio utility', () => {
  let playMock;
  let mockAudio;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    playMock = vi.fn().mockResolvedValue();
    mockAudio = {
      play: playMock
    };
    
    global.Audio = vi.fn().mockImplementation(() => mockAudio);
    global.fetch = vi.fn();
    global.alert = vi.fn();
  });
  
  afterEach(() => {
    // Cannot easily clear the Map inside the module, so we use unique text for each test to avoid cache hits
  });

  it('should fetch audio from backend and play it', async () => {
    global.fetch.mockResolvedValueOnce({
      json: vi.fn().mockResolvedValue({ success: true, audioContent: 'fetched-base64' })
    });

    await playAudio('Kissa', '', 'fi-FI', 1.0);

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/tts', expect.any(Object));
    expect(global.Audio).toHaveBeenCalledWith('data:audio/mp3;base64,fetched-base64');
    expect(playMock).toHaveBeenCalled();
  });

  it('should use cached audio on subsequent calls', async () => {
    global.fetch.mockResolvedValueOnce({
      json: vi.fn().mockResolvedValue({ success: true, audioContent: 'cached-base64' })
    });

    // First call fetches and caches
    await playAudio('Koira');
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.Audio).toHaveBeenCalledWith('data:audio/mp3;base64,cached-base64');
    expect(playMock).toHaveBeenCalledTimes(1);

    // Second call uses cache
    await playAudio('Koira');
    expect(global.fetch).toHaveBeenCalledTimes(1); // Still 1
    expect(global.Audio).toHaveBeenCalledWith('data:audio/mp3;base64,cached-base64');
    expect(playMock).toHaveBeenCalledTimes(2);
  });

  it('should handle API errors and show alert', async () => {
    global.fetch.mockResolvedValueOnce({
      json: vi.fn().mockResolvedValue({ success: false, error: 'Invalid API Key' })
    });
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await playAudio('Talo');

    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch TTS audio:', 'Invalid API Key');
    expect(global.alert).toHaveBeenCalled();
    expect(playMock).not.toHaveBeenCalled();
    
    consoleErrorSpy.mockRestore();
  });

  it('should handle network errors gracefully', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network failure'));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await playAudio('Auto');

    expect(consoleErrorSpy).toHaveBeenCalledWith('Network error fetching TTS:', expect.any(Error));
    expect(playMock).not.toHaveBeenCalled();
    
    consoleErrorSpy.mockRestore();
  });

  it('should do nothing if text is empty', async () => {
    await playAudio('');
    expect(global.fetch).not.toHaveBeenCalled();
    expect(playMock).not.toHaveBeenCalled();
  });
});
